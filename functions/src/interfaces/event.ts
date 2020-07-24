export interface Event {
  id: string;
  title: string;
  description: string;
  createrId: string;
  memberlimit: number;
  date: Date;
  time: string;
  location: string;
  groupid: string;
  price: number;
  currency: string;
  private: boolean;
  searchable: boolean;
}

export interface EventWithGroupId extends Event {
  groupName: string;
}
