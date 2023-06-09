import express from "express";
import { graphqlHTTP } from "express-graphql";
import {
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";

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

const app = express();

const CarType = new GraphQLObjectType({
  name: "Car",
  description: "This represent a car for a user.",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    brand: { type: new GraphQLNonNull(GraphQLString) },
    speed: { type: GraphQLInt },
    ownerId: { type: new GraphQLNonNull(GraphQLInt) },
    owner: {
      type: UserType,
      resolve: (car) => users.find((user) => user.id === car.ownerId),
    },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  description: "This represent a user.",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    cars: {
      type: new GraphQLList(CarType),
      resolve: (user) => cars.filter((car) => car.ownerId === user.id),
    },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "Root query",
  fields: () => ({
    cars: {
      type: new GraphQLList(CarType),
      description: "A list of cars",
      resolve: () => cars,
    },

    car: {
      type: CarType,
      description: "Single car",
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (_, args) => cars.find((car) => car.id === args.id),
    },

    users: {
      type: new GraphQLList(UserType),
      description: "A list of users.",
      resolve: () => users,
    },

    user: {
      type: UserType,
      description: "Single user.",
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve: (_, args) => users.find((user) => user.id === args.id),
    },
  }),
});

const RootMutation = new GraphQLObjectType({
  name: "Mutation",
  description: "Root mutation",
  fields: () => ({
    createCar: {
      type: CarType,
      description: "Create a car.",
      args: {
        brand: { type: new GraphQLNonNull(GraphQLString) },
        speed: { type: GraphQLInt },
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
      description: "Create a user.",
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: (_, args) => {
        const newUser = { id: users.length + 1, ...args };
        users.push(newUser);

        return newUser;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutation,
});

app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema,
  })
);

app.listen(8000);
console.log("Running a GraphQL API server at http://localhost:8000/graphql");
