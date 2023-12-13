import { Network } from 'testcontainers';
import { KafkaContainer } from '@testcontainers/kafka';

const DEFAULT_KAFKA_PORT = 9093;

// declare global {
//     namespace NodeJS {
//         interface Global {
//             __NETWORK__: any;
// 			__KAFKA_CONTAINER__: any;
// 			__KAFKA_BROKERS__: string[]
//         }
//     }
// }

module.exports = async () => {

	let globalWithKafka = global as typeof globalThis & {
		__NETWORK__: any;
		__KAFKA_CONTAINER__: any;
		__KAFKA_BROKERS__: string[]
	};

	// Create a network so the docker contains can talk to each other.
	const network = await new Network().start();
	globalWithKafka.__NETWORK__ = network;

	const kafkaContainer = await new KafkaContainer(
		process.env.KAFKA_CONTAINER_IMAGE
	)
		.withNetworkMode(network.getName())
		.withNetworkAliases('kafka')
		// .withEnvironment('KAFKA_ADVERTISED_LISTENERS', 'PLAINTEXT://kafka:9092') 
		// .withEnv('KAFKA_LISTENER_SECURITY_PROTOCOL_MAP', 'INSIDE:PLAINTEXT,OUTSIDE:PLAINTEXT')
        // .withEnv('KAFKA_INTER_BROKER_LISTENER_NAME', 'PLAINTEXT')
		.withExposedPorts(9092, DEFAULT_KAFKA_PORT)
		.start();

	globalWithKafka.__KAFKA_CONTAINER__ = kafkaContainer;

	// use the file system to expose the brokeruri for TestEnvironments
	// const kafkaBroker = 'kafka:9092';

	// const kafkaBrokerOutsideListener = container.getHost() + ':' + container.getMappedPort(9093);

	// mkdirp.sync(DIR);
	// await writeFile(path.join(DIR, 'kafkaBroker'), kafkaBrokerOutsideListener);

	const port = kafkaContainer.getMappedPort(DEFAULT_KAFKA_PORT);
    const host = kafkaContainer.getHost();

	globalWithKafka.__KAFKA_BROKERS__ = [`$host:$port`]
};
