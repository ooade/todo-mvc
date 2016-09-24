import { reduce, isArray, isFunction, mapValues } from 'lodash';
import { toCollectionName } from 'mongoose/lib/utils';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLBoolean,
  GraphQLInt
} from 'graphql';
import {
  mutationWithClientMutationId,
  connectionArgs,
  connectionDefinitions,
  globalIdField
} from 'graphql-relay';
import { subscriptionWithClientId } from 'graphql-relay-subscription';
import model from './../model';
import type, {
  GraphQLViewer,
  nodeInterface,
  getTypeFields,
  getArguments,
  setTypeFields
} from './../type';
import query, {
  idToCursor,
  getIdFetcher,
  connectionFromModel
} from './../query';
import { addHooks } from '../utils';
import viewerInstance from '../model/viewer';
import createInputObject from '../type/custom/to-input-object';

const idField = {
  name: 'id',
  type: new GraphQLNonNull(GraphQLID)
};

function getSingularQueryField(graffitiModel, type, hooks = {}) {
  const { name } = type;
  const { singular } = hooks;
  const singularName = name.toLowerCase();

  return {
    [singularName]: {
      type,
      args: {
        id: idField
      },
      resolve: addHooks(query.getOneResolver(graffitiModel), singular)
    }
  };
}

function getPluralQueryField(graffitiModel, type, hooks = {}) {
  const { name } = type;
  const { plural } = hooks;
  const pluralName = toCollectionName(name);

  return {
    [pluralName]: {
      type: new GraphQLList(type),
      args: getArguments(type, {
        id: {
          type: new GraphQLList(GraphQLID),
          description: `The ID of a ${name}`
        },
        ids: {
          type: new GraphQLList(GraphQLID),
          description: `The ID of a ${name}`
        }
      }),
      resolve: addHooks(query.getListResolver(graffitiModel), plural)
    }
  };
}

function getQueryField(graffitiModel, type, hooks) {
  return {
    ...getSingularQueryField(graffitiModel, type, hooks),
    ...getPluralQueryField(graffitiModel, type, hooks)
  };
}

function getConnectionField(graffitiModel, type, hooks = {}) {
  const { name } = type;
  const { plural } = hooks;
  const pluralName = toCollectionName(name.toLowerCase());
  const { connectionType } = connectionDefinitions({
    name,
    nodeType: type,
    connectionFields: {
      count: {
        name: 'count',
        type: GraphQLInt
      }
    }
  });

  return {
    [pluralName]: {
      args: getArguments(type, connectionArgs),
      type: connectionType,
      resolve: addHooks((rootValue, args, info) => connectionFromModel(graffitiModel, args, info), plural)
    }
  };
}

function getMutationField(graffitiModel, type, viewer, hooks = {}, allowMongoIDMutation) {
  const { name } = type;
  const { mutation } = hooks;

  const fields = getTypeFields(type);
  const inputFields = reduce(fields, (inputFields, field) => {
    if (field.type instanceof GraphQLObjectType) {
      if (field.type.name.endsWith('Connection')) {
        inputFields[field.name] = {
          name: field.name,
          type: new GraphQLList(GraphQLID)
        };
      } else if (field.type.mongooseEmbedded) {
        inputFields[field.name] = {
          name: field.name,
          type: createInputObject(field.type)
        };
      } else {
        inputFields[field.name] = {
          name: field.name,
          type: GraphQLID
        };
      }
    }

    if (field.type instanceof GraphQLList && field.type.ofType instanceof GraphQLObjectType) {
      inputFields[field.name] = {
        name: field.name,
        type: new GraphQLList(createInputObject(field.type.ofType))
      };
    } else if (!(field.type instanceof GraphQLObjectType)
        && field.name !== 'id' && field.name !== '__v'
        && (allowMongoIDMutation || field.name !== '_id')) {
      inputFields[field.name] = field;
    }

    return inputFields;
  }, {});

  const updateInputFields = reduce(fields, (inputFields, field) => {
    if (field.type instanceof GraphQLObjectType && field.type.name.endsWith('Connection')) {
      inputFields[`${field.name}_add`] = {
        name: field.name,
        type: new GraphQLList(GraphQLID)
      };
    }

    return inputFields;
  }, {});

  const changedName = `changed${name}`;
  const edgeName = `${changedName}Edge`;
  const nodeName = `${changedName}Node`;

  const addName = `add${name}`;
  const updateName = `update${name}`;
  const deleteName = `delete${name}`;

  return {
    [addName]: mutationWithClientMutationId({
      name: addName,
      inputFields,
      outputFields: {
        viewer,
        [edgeName]: {
          type: connectionDefinitions({
            name: changedName,
            nodeType: new GraphQLObjectType({
              name: nodeName,
              fields
            })
          }).edgeType,
          resolve: (node) => ({
            node,
            cursor: idToCursor(node.id)
          })
        }
      },
      mutateAndGetPayload: addHooks(query.getAddOneMutateHandler(graffitiModel), mutation)
    }),
    [updateName]: mutationWithClientMutationId({
      name: updateName,
      inputFields: {
        ...inputFields,
        ...updateInputFields,
        id: idField
      },
      outputFields: {
        [changedName]: {
          type,
          resolve: (node) => node
        }
      },
      mutateAndGetPayload: addHooks(query.getUpdateOneMutateHandler(graffitiModel), mutation)
    }),
    [deleteName]: mutationWithClientMutationId({
      name: deleteName,
      inputFields: {
        id: idField
      },
      outputFields: {
        viewer,
        ok: {
          type: GraphQLBoolean
        },
        id: idField
      },
      mutateAndGetPayload: addHooks(query.getDeleteOneMutateHandler(graffitiModel), mutation)
    })
  };
}

function getSubscriptionField(graffitiModel, type, viewer, hooks = {}, allowMongoIDMutation) {
  const { name } = type;
  const { subscription } = hooks;

  const fields = getTypeFields(type);

  const changedSubName = `changedSub${name}`;
  const edgeSubName = `${changedSubName}SubEdge`;
  const nodeSubName = `${changedSubName}SubNode`;

  const addSubName = `addSub${name}`;
  const updateSubName = `updateSub${name}`;
  const deleteSubName = `deleteSub${name}`;

  return {
    [addSubName]: subscriptionWithClientId({
      name: addSubName,
      outputFields: {
        viewer,
        [edgeSubName]: {
          type: connectionDefinitions({
            name: changedSubName,
            nodeType: new GraphQLObjectType({
              name: nodeSubName,
              fields
            })
          }).edgeType,
          resolve: (node) => ({
            node,
            cursor: idToCursor(node.id)
          })
        }
      },
      subscribe: (input, context) => {
        context.subscribe('add_data');
      }
    }),
    [updateSubName]: subscriptionWithClientId({
      name: updateSubName,
      inputFields: {
        id: idField
      },
      outputFields: {
        viewer,
        [changedSubName]: {
          type,
          resolve: (node) => node
        }
      },
      subscribe: ({ id }, context) => {
        context.subscribe(`update_data_${idField}`);
      }
    }),
    [deleteSubName]: subscriptionWithClientId({
      name: deleteSubName,
      outputFields: {
        viewer,
        ok: {
          type: GraphQLBoolean
        },
        id: idField
      },
      subscribe: (input, context) => {
        context.subscribe('delete_todo');
      }
    })
  };
}

/**
 * Returns query, mutation and subscription root fields
 * @param  {Array} graffitiModels
 * @param  {{Object, Boolean}} {hooks, mutation, subscription, allowMongoIDMutation}
 * @return {Object}
 */
function getFields(graffitiModels, {
    hooks = {}, mutation = true, subscription = true, allowMongoIDMutation = false,
    customQueries = {}, customMutations = {}, customSubscriptions = {}
  } = {}) {
  const types = type.getTypes(graffitiModels);
  const { viewer, singular } = hooks;

  const viewerFields = reduce(types, (fields, type, key) => {
    type.name = type.name || key;
    const graffitiModel = graffitiModels[type.name];
    return {
      ...fields,
      ...getConnectionField(graffitiModel, type, hooks),
      ...getSingularQueryField(graffitiModel, type, hooks)
    };
  }, {
    id: globalIdField('Viewer')
  });
  setTypeFields(GraphQLViewer, viewerFields);

  const viewerField = {
    name: 'Viewer',
    type: GraphQLViewer,
    resolve: addHooks(() => viewerInstance, viewer)
  };

  const { queries, mutations, subscriptions } = reduce(types, ({ queries, mutations, subscriptions }, type, key) => {
    type.name = type.name || key;
    const graffitiModel = graffitiModels[type.name];
    return {
      queries: {
        ...queries,
        ...getQueryField(graffitiModel, type, hooks)
      },
      mutations: {
        ...mutations,
        ...getMutationField(graffitiModel, type, viewerField, hooks, allowMongoIDMutation)
      },
      subscriptions: {
        ...subscriptions,
        ...getSubscriptionField(graffitiModel, type, viewerField, hooks)
      }
    };
  }, {
    queries: isFunction(customQueries)
      ? customQueries(mapValues(types, (type) => createInputObject(type)), types)
      : customQueries,
    mutations: isFunction(customMutations)
      ? customMutations(mapValues(types, (type) => createInputObject(type)), types)
      : customMutations,
    subscriptions: isFunction(customSubscriptions)
      ? customSubscriptions(mapValues(types, (type) => createInputObject(type)), types)
      : customSubscriptions
  });

  const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      ...queries,
      viewer: viewerField,
      node: {
        name: 'node',
        description: 'Fetches an object given its ID',
        type: nodeInterface,
        args: {
          id: {
            type: new GraphQLNonNull(GraphQLID),
            description: 'The ID of an object'
          }
        },
        resolve: addHooks(getIdFetcher(graffitiModels), singular)
      }
    }
  });

  const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: mutations
  });

  const RootSubscription = new GraphQLObjectType({
    name: 'RootSubscription',
    fields: subscriptions
  });

  const fields = {
    query: RootQuery
  };

  if (mutation) {
    fields.mutation = RootMutation;
  }

  if (subscription) {
    fields.subscription = RootSubscription;
  }

  return fields;
}

/**
 * Returns a GraphQL schema including query and mutation fields
 * @param  {Array} mongooseModels
 * @param  {Object} options
 * @return {GraphQLSchema}
 */
function getSchema(mongooseModels, options) {
  if (!isArray(mongooseModels)) {
    mongooseModels = [mongooseModels];
  }
  const graffitiModels = model.getModels(mongooseModels);
  const fields = getFields(graffitiModels, options);
  return new GraphQLSchema(fields);
}

export {
  getQueryField,
  getMutationField,
  getSubscriptionField,
  getFields,
  getSchema
};
