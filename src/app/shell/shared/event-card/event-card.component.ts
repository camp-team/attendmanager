import { Component, OnInit, Input } from '@angular/core';
import { Event } from 'src/app/interfaces/event';
import { Group } from 'src/app/interfaces/group';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { GroupService } from 'src/app/services/group.service';
import { Observable } from 'rxjs';
import { EventService } from 'src/app/services/event.service';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-event-card',
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
})
export class EventCardComponent implements OnInit {
  @Input() event: Event;

  uid: string;

  ifEvent = false;

  ifadmin: Observable<boolean>; // イベントを保有しているグループの管理者であるかの確認。Trueかfalseを返す

  ifFree: boolean;

  ifPrivate: boolean;

  ifWaitingJoinningMember: boolean;

  ifWaitingPayingMember: boolean;

  ifPast: boolean;

  attended = false;

  createrDisplayname: Observable<string>;
  groupName: Observable<string>;
  eventid: string;
  grouppicture: number;
  price: number;
  date: Date;

  constructor(
    private authService: AuthService,
    private groupService: GroupService,
    public eventService: EventService
  ) {}

  ngOnInit(): void {
    if (this.event) {
      this.uid = this.authService.uid;

      this.createrDisplayname = this.authService
        .getUser(this.event.createrId)
        .pipe(
          map((creater: User) => {
            return creater.displayName;
          })
        );

      this.groupName = this.groupService.getGroupinfo(this.event.groupid).pipe(
        map((group: Group) => {
          return group.name;
        })
      );

      this.eventid = this.event.id;

      this.date = this.event.date.toDate();

      this.price = this.event.price;

      if (this.price > 0) {
        this.ifFree = false;
      } else {
        this.ifFree = true;
      }

      if (this.event.private) {
        this.ifPrivate = true;
      } else {
        this.ifPrivate = false;
      }

      if (this.event.waitingJoinningMemberIds.includes(this.authService.uid)) {
        this.ifWaitingJoinningMember = true;
      } else {
        this.ifWaitingJoinningMember = false;
      }

      if (this.event.waitingPayingMemberIds.includes(this.authService.uid)) {
        this.ifWaitingPayingMember = true;
      } else {
        this.ifWaitingPayingMember = false;
      }

      const now = new Date();

      if (this.date > now) {
        this.ifPast = false;
      } else {
        this.ifPast = true;
      }

      this.groupService
        .getGrouppicture(this.event.groupid)
        .subscribe((grouppicture: number) => {
          this.grouppicture = grouppicture;
        });

      this.ifadmin = this.groupService.checkIfAdmin(
        this.authService.uid,
        this.event.groupid
      );

      if (this.event.attendingMemberIds.includes(this.authService.uid)) {
        this.attended = true;
      } else {
        this.attended = false;
      }

      this.ifEvent = true;
    } else {
      this.ifEvent = false;
    }
  }

  // nothing to attending (pay+public, pay+private, free+public, free+private)
  attendEvent() {
    this.eventService.attendEvent(this.uid, this.eventid);
  }

  payToAttendEvent() {
    this.eventService.payToAttendEvent(this.uid, this.eventid);
  }

  // attending to nothing (pay+public, pay+private, free+public, free+private)
  leaveEvent() {
    this.eventService.leaveEvent(this.uid, this.eventid);
  }

  // nothing to waitingJoinning (pay+private, free+private)
  joinWaitingJoinningList() {
    this.eventService.joinWaitingJoinningList(this.uid, this.event.id);
  }

  // waitingJoinning to waitingPaying (pay+private)
  joinWaitingPayingList() {
    this.eventService.joinWaitingPayingList(this.uid, this.event.id);
  }

  // waitingJoinning to nothing (pay+private, free+private)
  removeWaitingJoinningMember() {
    this.eventService.removeWaitingJoinningMember(this.uid, this.event.id);
  }

  // waitingPaying to nothing (pay+private)
  removeWaitingPayingMember() {
    this.eventService.removeWaitingPayingMember(this.uid, this.event.id);
  }
}
