export interface ConversationModel {
  cid: string;
  pid: string;
  title: string;
  price: number;
  images: string[];
  uids: string[];
  uid: string;
  username: string;
  avatar: string;
  messages: string[];
  updated: string;
}

export interface MessageModel {
  mid: string;
  sender: string;
  receiver: string;
  text: string;
  created: string;
}
