import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';

import { Mensaje } from '../models/mensaje.interface';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;
  public chats: Mensaje[] = [];
  public usuario: any = {};

  constructor(private angularFirestore: AngularFirestore, public afAuth: AngularFireAuth ) {

    this.afAuth.authState.subscribe(user => {
      if (!user) {
        return;
      } else {
        this.usuario.nombre = user.displayName;
        this.usuario.uid = user.uid;
      }
    });

  }

  login(proveedor: string) {
    if (proveedor === 'google') {
      this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider());
    } else {
      this.afAuth.auth.signInWithPopup(new auth.TwitterAuthProvider());
    }
  }


  logout() {
    this.usuario = {};
    this.afAuth.auth.signOut();
  }

  cargarMensajes() {
    this.itemsCollection = this.angularFirestore.collection<Mensaje>('chats', ref => ref.orderBy('fecha', 'desc').limit(10));

    return this.itemsCollection.valueChanges().pipe(map((mensajes: Mensaje[]) => {
      this.chats = [];

      for (const mensaje of mensajes) {
        this.chats.unshift(mensaje);
      }

      return this.chats;

    }));

  }

  agregarMensaje(texto: string) {

    const mensaje: Mensaje = {
      nombre: this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }

    return this.itemsCollection.add(mensaje);

  }


}
