export interface ViewNotificationModel {
  nid: string;
  pid: string;
  title: string;
  sender: string;
  senderUid: string;
  receiver: string;
  receiverUid: string;
  type: string;
  unread: boolean;
  created: string;
}
