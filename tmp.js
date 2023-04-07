import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} from "graphql";
import { AUTHORS, BOOKS } from "./data/mockData.js";

// Construct a schema, using GraphQL schema language
let users = [
  {
    id: 1,
    name: "Ngimdock",
  },
  {
    id: 2,
    name: "Dan",
  },
];

let cars = [
  {
    id: 1,
    brand: "Lambo 2010",
    ownerId: 2,
  },
  {
    id: 2,
    brand: "Ferari",
    ownerId: 1,
  },
  {
    id: 3,
    brand: "Vostvagen",
    ownerId: 2,
  },
];

const CarType = new GraphQLObjectType({
  name: "Car",
  description: "This represent a car for and user",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    brand: { type: new GraphQLNonNull(GraphQLString) },
    ownerId: { type: new GraphQLNonNull(GraphQLInt) },
    owner: {
      type: UserType,
      resolve: (car) => users.find((user) => user.id === car.ownerId),
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This reprensent a user",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    cars: {
      type: new GraphQLList(CarType),
      resolve: (currentUser) =>
        cars.filter((car) => car.ownerId === currentUser.id),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root Query",
  fields: () => ({
    car: {
      type: CarType,
      description: "A single car",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (_, { id: carId }) => cars.find((car) => car.id === carId),
    },

    cars: {
      type: new GraphQLList(CarType),
      description: "List of cars",
      resolve: () => cars,
    },

    user: {
      type: UserType,
      description: "A single user",
      args: {
        id: { type: GraphQLInt },
      },
      resolve: (_, args) => users.find(({ id }) => id === args.id),
    },

    users: {
      type: new GraphQLList(UserType),
      description: "List of users",
      resolve: () => users,
    },
  }),
});

const RootMutationType = new GraphQLObjectType({
  name: "Mutation",
  description: "Root mutation",
  fields: () => ({
    addCar: {
      type: CarType,
      description: "Add a car",
      args: {
        brand: { type: new GraphQLNonNull(GraphQLString) },
        ownerId: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (_, args) => {
        const newCar = { id: cars.length + 1, ...args };

        cars.push(newCar);

        return newCar;
      },
    },

    createUser: {
      type: UserType,
      description: "Create a new user",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => {
        const newUser = { id: users.length + 1, ...args };

        users.push(newUser);

        return newUser;
      },
    },

    removeUser: {
      type: new GraphQLList(UserType),
      description: "Remove a user",
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },

      resolve: (_, { id }) => {
        const newUsers = users.filter((user) => user.id !== id);

        users = newUsers;

        return users;
      },
    },
  }),
});

// The root provides a resolver function for each API endpoint
const root = {
  hello: () => {
    return "Hello world!";
  },
};

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});

const app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: schema,
    // rootValue: root,
  })
);

app.listen(8000);
console.log("Running a GraphQL API server at http://localhost:8000/graphql");
