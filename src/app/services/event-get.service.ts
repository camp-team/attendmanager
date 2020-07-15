import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Event } from '../interfaces/event';
import { map, switchMap } from 'rxjs/operators';
import { Observable, combineLatest, of } from 'rxjs';
import { Id } from '../interfaces/id';

@Injectable({
  providedIn: 'root',
})
export class EventGetService {
  constructor(private db: AngularFirestore) {}

  getEvent(eventid: string): Observable<Event> {
    return this.db.doc<Event>(`events/${eventid}`).valueChanges();
  }

  getMyEvents(uid: string): Observable<Event[]> {
    return this.db
      .collection<Id>(`users/${uid}/groupIds`)
      .valueChanges()
      .pipe(
        map((Ids: Id[]) => {
          const groupIds: string[] = [];
          Ids.map((id: Id) => {
            groupIds.push(id.id);
          });
          return groupIds;
        }),
        switchMap((groupIds: string[]) => {
          const eventIdsList: Observable<Id[]>[] = [];
          groupIds.map((groupId: string) => {
            const eventIds: Observable<Id[]> = this.db
              .collection<Id>(`groups/${groupId}/eventIds`)
              .valueChanges();
            eventIdsList.push(eventIds);
          });
          return combineLatest(eventIdsList);
        }),
        switchMap((eventIdsList: Id[][]) => {
          const events: Observable<Event>[] = [];
          eventIdsList.map((eventIds: Id[]) => {
            eventIds.map((eventId: Id) => {
              const event: Observable<Event> = this.db
                .doc<Event>(`events/${eventId.id}`)
                .valueChanges();
              events.push(event);
            });
          });
          return combineLatest(events);
        })
      );
  }

  getWaitingJoinningEvents(uid: string): Observable<Event[]> {
    return this.db
      .collection<Id>(`users/${uid}/waitingJoinningEventIds`)
      .valueChanges()
      .pipe(
        switchMap((waitingJoinningEventIds: Id[]) => {
          if (waitingJoinningEventIds.length) {
            const result: Observable<Event>[] = [];
            waitingJoinningEventIds.map((waitingJoinningEventId: Id) => {
              result.push(
                this.db
                  .doc<Event>(`events/${waitingJoinningEventId.id}`)
                  .valueChanges()
              );
            });
            return combineLatest(result);
          } else {
            return of([]);
          }
        })
      );
  }

  getWaitingJoinningEventIds(uid: string): Observable<string[]> {
    return this.db
      .collection<Id>(`users/${uid}/waitingJoinningEventIds`)
      .valueChanges()
      .pipe(
        map((waitingJoinningEventIds: Id[]) => {
          const Ids: string[] = [];
          waitingJoinningEventIds.map((waitingJoinningEventId: Id) => {
            Ids.push(waitingJoinningEventId.id);
          });
          return Ids;
        })
      );
  }

  getWaitingPayingEvents(uid: string): Observable<Event[]> {
    return this.db
      .collection<Id>(`users/${uid}/waitingPayingEventIds`)
      .valueChanges()
      .pipe(
        switchMap((waitingPayingEventIds: Id[]) => {
          if (waitingPayingEventIds.length) {
            const result: Observable<Event>[] = [];
            waitingPayingEventIds.map((waitingPayingEventId: Id) => {
              result.push(
                this.db
                  .doc<Event>(`events/${waitingPayingEventId.id}`)
                  .valueChanges()
              );
            });
            return combineLatest(result);
          } else {
            return of([]);
          }
        })
      );
  }

  getWaitingPayingEventIds(uid: string): Observable<string[]> {
    return this.db
      .collection<Id>(`users/${uid}/waitingPayingEventIds`)
      .valueChanges()
      .pipe(
        map((waitingPayingEventIds: Id[]) => {
          const Ids: string[] = [];
          waitingPayingEventIds.map((waitingPayingEventId: Id) => {
            Ids.push(waitingPayingEventId.id);
          });
          return Ids;
        })
      );
  }

  // getAttendingEvents(uid: string): Observable<Event[]> {
  //   return this.db
  //     .collection(`users/${uid}/eventIds`)
  //     .valueChanges()
  //     .pipe(
  //       switchMap((eventIds: Id[]) => {
  //         if (eventIds.length) {
  //           const result: Observable<Event>[] = [];
  //           eventIds.map((eventId: Id) => {
  //             const attendingEvent: Observable<Event> = this.db
  //               .doc<Event>(`events/${eventId.id}`)
  //               .valueChanges();
  //             result.push(attendingEvent);
  //           });
  //           return combineLatest(result);
  //         } else {
  //           return of([]);
  //         }
  //       })
  //     );
  // }

  // getAttendingEventIds(uid: string): Observable<string[]> {
  //   return this.db
  //     .collection<Id>(`users/${uid}/eventIds`)
  //     .valueChanges()
  //     .pipe(
  //       map((eventIds: Id[]) => {
  //         const Ids: string[] = [];
  //         eventIds.map((eventId: Id) => {
  //           Ids.push(eventId.id);
  //         });
  //         return Ids;
  //       })
  //     );
  // }

  getAttendingEvents(uid: string): Observable<Event[]> {
    return this.db
      .collection<Id>(`users/${uid}/eventIds`)
      .valueChanges()
      .pipe(
        switchMap((eventIds: Id[]) => {
          const attendingEvents: Observable<Event>[] = [];
          eventIds.map((eventId: Id) => {
            attendingEvents.push(
              this.db.doc<Event>(`events/${eventId.id}`).valueChanges()
            );
          });
          return combineLatest(attendingEvents);
        }),
        map((attendingEvents: Event[]) => {
          const attendedEvents: Event[] = [];
          attendingEvents.map((attendingEvent: Event) => {
            const now: number = new Date().getTime();
            if (attendingEvent.date.toMillis() > now) {
              attendedEvents.push(attendingEvent);
            }
          });
          console.log(attendedEvents);
          return attendedEvents;
        })
      );
  }

  getAttendingEventIds(uid: string): Observable<string[]> {
    return this.db
      .collection<Id>(`users/${uid}/eventIds`)
      .valueChanges()
      .pipe(
        switchMap((eventIds: Id[]) => {
          const attendingEvents: Observable<Event>[] = [];
          eventIds.map((eventId: Id) => {
            attendingEvents.push(
              this.db.doc<Event>(`events/${eventId.id}`).valueChanges()
            );
          });
          return combineLatest(attendingEvents);
        }),
        map((attendingEvents: Event[]) => {
          const attendedEvents: Event[] = [];
          attendingEvents.map((attendingEvent: Event) => {
            const now: number = new Date().getTime();
            if (attendingEvent.date.toMillis() > now) {
              attendedEvents.push(attendingEvent);
            }
          });
          return attendedEvents;
        }),
        map((attendedEvents: Event[]) => {
          if (attendedEvents.length) {
            const attendedEventIds: string[] = [];
            attendedEvents.map((attendedEvent: Event) => {
              attendedEventIds.push(attendedEvent.id);
            });
            return attendedEventIds;
          } else {
            return [];
          }
        })
      );
  }

  getAttendedEvents(uid: string): Observable<Event[]> {
    return this.db
      .collection<Id>(`users/${uid}/eventIds`)
      .valueChanges()
      .pipe(
        switchMap((eventIds: Id[]) => {
          const attendingEvents: Observable<Event>[] = [];
          eventIds.map((eventId: Id) => {
            attendingEvents.push(
              this.db.doc<Event>(`events/${eventId.id}`).valueChanges()
            );
          });
          return combineLatest(attendingEvents);
        }),
        map((attendingEvents: Event[]) => {
          const attendedEvents: Event[] = [];
          attendingEvents.map((attendingEvent: Event) => {
            const now = new Date().getTime();
            if (attendingEvent.date.toMillis() < now) {
              attendedEvents.push(attendingEvent);
            }
          });
          console.log(attendedEvents);
          return attendedEvents;
        })
      );
  }

  getAttendedEventIds(uid: string): Observable<string[]> {
    return this.db
      .collection<Id>(`users/${uid}/eventIds`)
      .valueChanges()
      .pipe(
        switchMap((eventIds: Id[]) => {
          const attendingEvents: Observable<Event>[] = [];
          eventIds.map((eventId: Id) => {
            attendingEvents.push(
              this.db.doc<Event>(`events/${eventId.id}`).valueChanges()
            );
          });
          return combineLatest(attendingEvents);
        }),
        map((attendingEvents: Event[]) => {
          const attendedEvents: Event[] = [];
          attendingEvents.map((attendingEvent: Event) => {
            const now: number = new Date().getTime();
            if (attendingEvent.date.toMillis() < now) {
              attendedEvents.push(attendingEvent);
            }
          });
          console.log(attendedEvents);
          return attendedEvents;
        }),
        map((attendedEvents: Event[]) => {
          if (attendedEvents.length) {
            const attendedEventIds: string[] = [];
            attendedEvents.map((attendedEvent: Event) => {
              attendedEventIds.push(attendedEvent.id);
            });
            return attendedEventIds;
          } else {
            return [];
          }
        })
      );
  }

  getSearchableEvents(): Observable<Event[]> {
    return this.db
      .collection<Event>(`events`, (ref) => ref.where('searchable', '==', true))
      .valueChanges();
  }

  getAttendingMemberIds(eventId: string): Observable<string[]> {
    return this.db
      .collection(`events/${eventId}/attendingMemberIds`)
      .valueChanges()
      .pipe(
        map((attendingMemberIds: Id[]) => {
          if (attendingMemberIds.length) {
            const result: string[] = [];
            attendingMemberIds.map((attendingMemberId: Id) => {
              result.push(attendingMemberId.id);
            });
            return result;
          } else {
            return [];
          }
        })
      );
  }

  getWaitingPayingMemberIds(eventId: string): Observable<string[]> {
    return this.db
      .collection(`events/${eventId}/waitingPayingMemberIds`)
      .valueChanges()
      .pipe(
        map((waitingPayingMemberIds: Id[]) => {
          if (waitingPayingMemberIds.length) {
            const result: string[] = [];
            waitingPayingMemberIds.map((waitingPayingMemberId: Id) => {
              result.push(waitingPayingMemberId.id);
            });
            return result;
          } else {
            return [];
          }
        })
      );
  }

  getWaitingJoinningMemberIds(eventId: string): Observable<string[]> {
    return this.db
      .collection(`events/${eventId}/waitingJoinningMemberIds`)
      .valueChanges()
      .pipe(
        map((waitingJoinningMemberIds: Id[]) => {
          if (waitingJoinningMemberIds.length) {
            const result: string[] = [];
            waitingJoinningMemberIds.map((waitingJoinningMemberId: Id) => {
              result.push(waitingJoinningMemberId.id);
            });
            return result;
          } else {
            return [];
          }
        })
      );
  }
}
