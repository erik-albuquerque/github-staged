
type User = {
  id: string;
  name: string;
};

type Room = {
  id: string;
  name: string;
  userId: string;
  users: User[];
};

const rooms: Room[] = [
  { id: "1a2", name: "master", userId: 'userMaster', users: [] },
  { id: "2ds", name: "room01", userId: 'user01' , users: [] },
];

export { rooms };
