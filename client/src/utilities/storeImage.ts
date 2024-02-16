import {
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

export const storeImage = async (
  storage: FirebaseStorage,
  pid: string,
  imageFile: File,
  index: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `listings/${pid}/image${index}`);

    const uploadTask = uploadBytesResumable(storageRef, imageFile);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");

        switch (snapshot.state) {
          case "paused":
            console.log("Upload paused");
            break;
          case "running":
            console.log("Upload running");
            break;
          default:
            break;
        }
      },
      (error) => {
        reject(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};
