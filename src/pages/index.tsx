import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { rooms as roomsConstants } from "../constants";

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

type Error = {
  id: string;
  type: string;
  message: string;
};

type RoomError = Error[];

const socket = io("http://localhost:3333");

const Home: NextPage = () => {
  const [rooms, setRooms] = useState(roomsConstants);

  const [errors, setErrors] = useState<RoomError>([]);

  const [user, setUser] = useState<User>({} as User);

  const [userJoin, setUserJoin] = useState("");

  const [showChannels, setShowChannels] = useState(false);

  const handleLogIn = (user: User) => {
    const localUser = localStorage.getItem("user");

    if (!localUser) {
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
    } else {
      setUser(JSON.parse(localUser));
    }

    setShowChannels(true);
  };

  const handleError = (error: Error) => {
    setErrors([...errors, error]);
  };

  const joinRoom = (room: Room) => {
    const oldRooms = [...rooms];

    const roomExists = oldRooms.find((r) => r.id === room.id);

    if (!roomExists) {
      console.warn(`${room.name} not found!`);
      return;
    }

    const userExists = roomExists.users.find((u) => u.name === user.name);

    if (userExists && roomExists.users.includes(userExists)) {
      console.log("Hey buddy, you are already here!");
      console.warn(`${user.name}, you are already in the ${room.name}`);

      const error: Error = {
        id: uuidv4(),
        type: "client",
        message: "Hey buddy, you are already here!",
      };

      handleError(error);

      return;
    }

    const userInRoom = roomExists.users.find((u) => u.name === user.name);

    if (!userInRoom) {
      oldRooms[oldRooms.indexOf(roomExists)] = {
        ...roomExists,
        users: [...roomExists.users, user],
      };

      setRooms(oldRooms);
    }

    socket.emit("join-room", {
      room,
      user,
    });
    // console.log("join-room", { room, rooms });
  };

  const leaveRoom = (room: Room) => {
    const oldRooms = [...rooms];

    const roomExists = oldRooms.find((r) => r.id === room.id);

    if (!roomExists) {
      console.warn(`${room.name} not found!`);
      return;
    }

    const userExists = roomExists.users.find((u) => u.name === user.name);

    if (!userExists) {
      console.log("Hey buddy, you do not belong in this room!");
      console.warn(`${user.name}, you do not belong in the ${room.name}`);

      const error: Error = {
        id: uuidv4(),
        type: "client",
        message: "Hey man, you do not belong in this room!",
      };

      handleError(error);

      return;
    }

    const newUsers = roomExists.users.filter((u) => u.name !== user.name);

    oldRooms[oldRooms.indexOf(roomExists)] = {
      ...roomExists,
      users: newUsers,
    };

    setRooms(oldRooms);

    socket.emit("leave-room", {
      room,
      user,
    });
  };

  // clear join user
  useEffect(() => {
    const interval = setInterval(() => {
      setErrors([]);
      setUserJoin("");
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // join room
  useEffect(() => {
    socket.on("joinRoom", (data) => {
      const room = data.room;
      const oldRooms = [...rooms];

      const oldRoom = oldRooms.find((or) => or.id === room.id);

      if (oldRoom) {
        oldRoom.users = data.room.users;

        oldRooms[oldRooms.indexOf(oldRoom)] = oldRoom;

        setRooms(oldRooms);

        setUserJoin(data.user.name);
      }
    });
  }, [rooms]);

  // leave room
  useEffect(() => {
    socket.on("leaveRoom", (data) => {
      const room = data.room;
      let oldRooms = [...rooms];

      const oldRoom = oldRooms.find((or) => or.id === room.id);

      if (oldRoom) {
        oldRoom.users = data.room.users;

        oldRooms[oldRooms.indexOf(oldRoom)] = oldRoom;

        setRooms(oldRooms);
      }

      console.log(`
        [client]: ${data.user.name} has left of ${data.room.name}.
        `);
    });

    // return () => {
    //   socket.close();
    // };
  }, [rooms]);

  // auto log in
  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      setUser(JSON.parse(user));
      setShowChannels(true);
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Head>
        <title>Sushi Stage</title>
      </Head>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        <h1 style={{ marginBottom: 0 }}>Sushi Stage</h1>
        <span>log as {user.name}</span>
      </div>

      {!showChannels && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <input
            type="text"
            placeholder="Nickname"
            onChange={(e) => setUser({ id: uuidv4(), name: e.target.value })}
          />
          <button onClick={() => handleLogIn(user)}>login</button>
        </div>
      )}

      {showChannels && (
        <>
          <h2>Channels</h2>

          <div
            style={{
              maxWidth: "500px",
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            {rooms.map((room) => (
              <div
                key={room.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <button onClick={() => joinRoom(room)}>{room.name}</button>
                <button onClick={() => leaveRoom(room)}>disconnect</button>
                <span>
                  by{" "}
                  <a href="" style={{ textDecoration: "none" }}>
                    {room.userId}
                  </a>
                </span>
                {room.users.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "8px",
                      }}
                    >
                      <h4 style={{ margin: 0 }}>
                        Users <br />
                        connected <br />
                        on #{room.name}
                      </h4>
                      {userJoin && (
                        <span
                          style={{
                            color: "green",
                          }}
                        >
                          {userJoin !== user.name
                            ? `${userJoin} has joined on ${room.name}`
                            : `you joined on ${room.name}`}
                        </span>
                      )}
                    </div>
                    {room.users.map((user) => (
                      <span key={user.id}>{user.name}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {errors.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {errors.map((error) => (
                  <span key={error.id}>
                    {error.type}:{" "}
                    <span style={{ color: "red" }}>{error.message}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
