export interface AddListingModel {
  title: string;
  description: string;
  price: number;
  category: string;
  imageFiles: FileList | null;
}

export interface ViewListingModel {
  pid: string;
  uid: string;
  username: string;
  avatar: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  offers: string[];
  sold: boolean;
  created: string;
  updated: string;
}

export interface UpdateListingModel {
  pid: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  offers: string[];
  sold: boolean;
}
