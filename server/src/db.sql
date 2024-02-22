CREATE TABLE users (
  uid TEXT PRIMARY KEY NOT NULL,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL,
  password TEXT NOT NULL,
  avatar TEXT NOT NULL
);

CREATE TABLE listings (
  pid TEXT PRIMARY KEY NOT NULL,
  uid TEXT NOT NULL,
  username VARCHAR(50) NOT NULL,
  avatar TEXT NOT NULL,
  title VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  category VARCHAR(50) NOT NULL,
  images TEXT[] NOT NULL,
  offers TEXT[] NOT NULL,
  sold BOOLEAN NOT NULL,
  created TIMESTAMP NOT NULL,
  updated TIMESTAMP NOT NULL
);

CREATE TABLE conversations (
  cid TEXT PRIMARY KEY NOT NULL,
  pid TEXT NOT NULL,
  uids TEXT[] NOT NULL,
  messages TEXT[],
  updated TIMESTAMP NOT NULL
);

CREATE TABLE messages (
  mid TEXT PRIMARY KEY NOT NULL,
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  text VARCHAR(100) NOT NULL,
  created TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
  nid TEXT NOT NULL,
  pid TEXT NOT NULL,
  title TEXT NOT NULL,
  sender TEXT NOT NULL,
  senderUid TEXT NOT NULL,
  receiver TEXT NOT NULL,
  receiverUid TEXT NOT NULL,
  type TEXT NOT NULL,
  unread BOOLEAN NOT NULL,
  created TIMESTAMP NOT NULL
);