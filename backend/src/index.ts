import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@apollo/server/express4';
import express , { Request, Response, NextFunction } from 'express'
import http from 'http'
import bodyParser from 'body-parser';
import router from './routes';
import typeDefs from './schema.graphql'
import resolvers from './bomResolver';


async function startApolloServer(typeDefs: any, resolvers: any) {
  const app = express();
  app.use('/restapi', router)

  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (err) => {
      console.error(err);
      return err;
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();

  const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  };

  
  app.use(
    bodyParser.json({limit: '10mb'}),
    expressMiddleware(server),
    errorHandler
  )

  await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000`);
}

startApolloServer(typeDefs, resolvers)  