import type { NextPage } from "next";
import Head from "next/head";
import { rooms } from "../constants";

const Home: NextPage = () => {
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

      <h2>Rooms</h2>

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
            <button>{room.name}</button>
            <span>
              by{" "}
              <a href="" style={{ textDecoration: "none" }}>
                {room.userId}
              </a>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
