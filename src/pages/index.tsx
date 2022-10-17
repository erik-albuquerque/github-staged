import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
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

const Home: NextPage = () => {
  const [rooms, setRooms] = useState(roomsConstants);

  const [errors, setErrors] = useState<RoomError>([]);

  const currentUser = { id: uuidv4(), name: "main" };

  const handleError = (error: Error) => {
    setErrors([...errors, error]);
  };

  const joinRoom = (room: Room) => {
    const oldRooms = [...rooms];

    const roomExists = oldRooms.filter((r) => r.id === room.id).pop();

    if (!roomExists) {
      console.warn(`${room.name} not found!`);
      return;
    }

    const userExists = roomExists.users
      .filter((user) => user.name === currentUser.name)
      .pop();

    if (userExists) {
      console.log("Hey buddy, you are already here!");
      console.warn(`${currentUser.name}, you are already in the ${room.name}`);

      const error: Error = {
        id: uuidv4(),
        type: "client",
        message: "Hey buddy, you are already here!",
      };

      handleError(error);

      return;
    }

    oldRooms[oldRooms.indexOf(roomExists)] = {
      ...roomExists,
      users: [...roomExists.users, currentUser],
    };

    setRooms(oldRooms);

    console.log("joinRoom", { room, rooms });
  };

  const leftRoom = (room: Room) => {
    const oldRooms = [...rooms];

    const roomExists = oldRooms.filter((r) => r.id === room.id).pop();

    if (!roomExists) {
      console.warn(`${room.name} not found!`);
      return;
    }

    const userExists = roomExists.users
      .filter((user) => user.name === currentUser.name)
      .pop();

    if (!userExists) {
      console.log("Hey buddy, you do not belong in this room!");
      console.warn(
        `${currentUser.name}, you do not belong in the ${room.name}`
      );

      const error: Error = {
        id: uuidv4(),
        type: "client",
        message: "Hey man, you do not belong in this room!",
      };

      handleError(error);

      return;
    }

    const newUsers = roomExists.users.filter(
      (user) => user.name !== currentUser.name
    );

    oldRooms[oldRooms.indexOf(roomExists)] = {
      ...roomExists,
      users: newUsers,
    };

    setRooms(oldRooms);

    console.log(`${currentUser.name} has left of ${room.name}`);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setErrors([]);
    }, 5000);

    return () => clearInterval(interval);
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
      <h1>Sushi Stage</h1>

      <h2>Channels</h2>

      <div
        style={{
          maxWidth: "400px",
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
            <button onClick={() => leftRoom(room)}>disconnect</button>
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
                <h4 style={{ margin: 0 }}>
                  Users <br />
                  connected <br />
                  on #{room.name}
                </h4>
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
    </div>
  );
};

export default Home;
