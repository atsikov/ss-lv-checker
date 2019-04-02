import { connect, MongoClient } from "mongodb";
import { DataStorage } from "./interface";

const dbName = "sslv-apartments";
const collectionName = "urls";

export class StorageMongoDb implements DataStorage {
    private static connection: MongoClient;

    private uri: string;

    constructor(url: string = "mongodb://localhost:27017") {
        this.uri = url;
    }

    public open() {
        return connect(
            this.uri,
            { useNewUrlParser: true },
        ).then(client => {
            StorageMongoDb.connection = client;
        });
    }

    public close() {
        return StorageMongoDb.connection.close();
    }

    public insertUrls(urls: string[]) {
        const db = StorageMongoDb.connection.db(dbName);
        return db.collection(collectionName)
            .insertMany(
                urls.map(url => ({ link: url }),
            ),
        );
    }
    
    public selectAllUrls(): Promise<string[]> {
        return new Promise(resolve => {
            StorageMongoDb.connection
                .db(dbName)
                .collection(collectionName)
                .find({})
                .project({ link: 1, _id: 0 })
                .toArray((err, docs) => resolve(docs.map(doc => doc.link)));
            });
    }
    
    public deleteUrls(urls: string[]) {
        return new Promise(resolve => {
            StorageMongoDb.connection
                .db(dbName)
                .collection(collectionName)
                .deleteMany(
                    {
                        link: {
                            "$in": urls,
                        },
                    },
                    resolve,
                );
        });
    }
}
