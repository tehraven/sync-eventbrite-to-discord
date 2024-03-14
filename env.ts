import { config } from 'dotenv';
import "reflect-metadata";

config();

if(!('DRY_RUN' in process.env)) {
    console.error('Please see the ReadMe file to setup your local environment.');
    process.exit(1);
}