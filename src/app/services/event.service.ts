import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Event } from '../interfaces/event';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from './group.service';
import { map, switchMap } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { firestore } from 'firebase';
import { Group } from '../interfaces/group';
@Injectable({
  providedIn: 'root',
})
export class EventService {
  constructor(
    private db: AngularFirestore,
    private groupService: GroupService,
    private snackbar: MatSnackBar
  ) {}

  async createEvent(event: Event) {
    const id = event.id;
    await this.db
      .doc(`events/${id}`)
      .set(event)
      .then(() =>
        this.db
          .doc(`groups/${event.groupid}`)
          .update({ eventIds: firestore.FieldValue.arrayUnion(event.id) })
      )
      .then(() =>
        this.snackbar.open('Successfully created the event', null, {
          duration: 2000,
        })
      );
  }

  getEvent(eventid: string): Observable<Event> {
    return this.db.doc<Event>(`events/${eventid}`).valueChanges();
  }

  getEvents(uid: string): Observable<Event[]> {
    const groups$: Observable<Group[]> = this.groupService.getMyGroup(uid);
    return groups$.pipe(
      switchMap((groups: Group[]) => {
        const eventIdsList: string[][] = groups.map((group) => group.eventIds);
        const eventListObs$: Observable<Event[]>[] = eventIdsList.map(
          (eventIds: string[]) => {
            if (eventIds?.length) {
              const events$: Observable<
                Event
              >[] = eventIds.map((eventId: string) =>
                this.db.doc<Event>(`events/${eventId}`).valueChanges()
              );
              return combineLatest(events$);
            } else {
              return of([]);
            }
          }
        );
        return combineLatest(eventListObs$);
      }),
      map((eventsList: Event[][]) => {
        const results: Event[] = [].concat(...eventsList);
        console.log(results);
        return results;
      })
    );
  }

  async updateEvent(uid: string, event: Omit<Event, 'createrId'>) {
    await this.db
      .doc(`events/${event.id}`)
      .set(event, { merge: true })
      .then(() =>
        this.snackbar.open('Successfully updated the event', null, {
          duration: 2000,
        })
      );
  }

  async deleteEvent(eventid: string, groupid: string) {
    await this.db
      .doc(`events/${eventid}`)
      .delete()
      .then(() =>
        this.db
          .doc(`groups/${groupid}`)
          .update({ eventIds: firestore.FieldValue.arrayRemove(eventid) })
      )
      .then(() =>
        this.snackbar.open('Successfully deleted the event', null, {
          duration: 2000,
        })
      );
  }

  getSearchableEvents(): Observable<Event[]> {
    return this.db
      .collection<Event>(`events`, (ref) => ref.where('searchable', '==', true))
      .valueChanges();
  }

  getAttendingEvents(uid: string): Observable<Event[]> {
    return this.db
      .collection<Event>(`events`, (ref) =>
        ref.where('attendingMemberIds', 'array-contains', uid)
      )
      .valueChanges();
  }

  // nothing to attending (pay+public, pay+private, free+public, free+private)
  async attendEvent(uid: string, eventid: string) {
    await this.db
      .doc(`events/${eventid}`)
      .update({ attendingMemberIds: firestore.FieldValue.arrayUnion(uid) });
  }

  // waitingPayinglist to attending (pay+public, pay+private, free+public, free+private)
  async payToAttendEvent(uid: string, eventid: string) {
    await this.db
      .doc(`events/${eventid}`)
      .update({ attendingMemberIds: firestore.FieldValue.arrayUnion(uid) })
      .then(() => {
        this.db.doc(`events/${eventid}`).update({
          waitingPayingMemberIds: firestore.FieldValue.arrayRemove(uid),
        });
      });
  }

  // attending to nothing (pay+public, pay+private, free+public, free+private)
  async leaveEvent(uid: string, eventid: string) {
    await this.db
      .doc(`events/${eventid}`)
      .update({ attendingMemberIds: firestore.FieldValue.arrayRemove(uid) });
  }

  // nothing to waitingJoinning (pay+private, free+private)
  async joinWaitingJoinningList(uid: string, eventId: string) {
    await this.db.doc(`events/${eventId}`).update({
      waitingJoinningMemberIds: firestore.FieldValue.arrayUnion(uid),
    });
  }

  // waitingJoinning to waitingPaying (pay+private)
  async joinWaitingPayingList(uid: string, eventId: string) {
    await this.db
      .doc(`events/${eventId}`)
      .update({
        waitingJoinningMemberIds: firestore.FieldValue.arrayRemove(uid),
      })
      .then(() => {
        this.db.doc(`events/${eventId}`).update({
          waitingPayingMemberIds: firestore.FieldValue.arrayUnion(uid),
        });
      });
  }

  // waitingJoinning to nothing (pay+private, free+private)
  async removeWaitingJoinningMember(uid: string, eventId: string) {
    await this.db.doc(`events/${eventId}`).update({
      waitingJoinningMemberIds: firestore.FieldValue.arrayRemove(uid),
    });
  }

  // waitingPaying to nothing (pay+private)
  async removeWaitingPayingMember(uid: string, eventId: string) {
    await this.db.doc(`events/${eventId}`).update({
      waitingPayingMemberIds: firestore.FieldValue.arrayRemove(uid),
    });
  }

  // waitingJoinning to attending (free+private)
  async waitingJoinningMemberToAttendingMember(uid: string, eventId: string) {
    await this.db
      .doc(`events/${eventId}`)
      .update({
        waitingJoinningMemberIds: firestore.FieldValue.arrayRemove(uid),
      })
      .then(() => {
        this.db
          .doc(`events/${eventId}`)
          .update({ attendingMemberIds: firestore.FieldValue.arrayUnion(uid) });
      });
  }
}
