import { Injectable } from '@nestjs/common';
import * as firebase from 'firebase-admin';
import { ResultSetHeader } from 'mysql2';
import { DatabaseService } from './database.service';

@Injectable()
export class FireBaseService {
  constructor(private db: DatabaseService) {
    const firebase_credentials = JSON.parse(process.env.FIREBASE_CREDENTIAL_JSON);
    firebase.initializeApp({
      credential: firebase.credential.cert(firebase_credentials),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }

  sendFirebaseMessages(token_list: { m_no: number; pt_token: string }[]) {
    token_list.forEach((data) => {
      const message = {
        notification: {
          title: '',
          body: '',
        },

        data: null,
        token: data.pt_token,
      };
      firebase
        .messaging()
        .send(message)
        .then((response) => {
          // Response is a message ID string.
          console.log('Successfully sent message:', response);
        })
        .catch((error) => {
          console.log('Error sending message:', error);
        });
    });
  }
}
