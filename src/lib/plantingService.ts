import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './AuthContext';

// Define crop status types
export type CropStatus = 'upcoming' | 'active' | 'ready-to-harvest' | 'delayed' | 'completed';

// Define crop interfaces
export interface BaseCrop {
  id?: string;
  name: string;
  variety: string;
  location: string;
  area: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface ActiveCrop extends BaseCrop {
  plantingDate: string;
  expectedHarvest: string;
  status: Exclude<CropStatus, 'completed'>;
  alerts: string[];
}

export interface HistoricalCrop extends BaseCrop {
  plantingDate: string;
  harvestDate: string;
  yield: string;
  notes: string;
  status: 'completed';
}

export type Crop = ActiveCrop | HistoricalCrop;

// Helper function to determine if a crop is historical
export const isHistoricalCrop = (crop: Crop): crop is HistoricalCrop => {
  return crop.status === 'completed';
};

// Helper function to convert Firestore document to Crop object
export const convertDocToCrop = (doc: DocumentData): Crop => {
  const data = doc.data();

  if (data.status === 'completed') {
    return {
      id: doc.id,
      name: data.name,
      variety: data.variety,
      plantingDate: data.plantingDate,
      harvestDate: data.harvestDate,
      location: data.location,
      area: data.area,
      yield: data.yield,
      notes: data.notes,
      status: data.status,
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as HistoricalCrop;
  } else {
    return {
      id: doc.id,
      name: data.name,
      variety: data.variety,
      plantingDate: data.plantingDate,
      expectedHarvest: data.expectedHarvest,
      location: data.location,
      area: data.area,
      status: data.status,
      alerts: data.alerts || [],
      userId: data.userId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    } as ActiveCrop;
  }
};

// CRUD operations for crops
export const cropsCollection = collection(db, 'crops');

// Create a new crop
export const addCrop = async (crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const cropWithTimestamps = {
    ...crop,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(cropsCollection, cropWithTimestamps);
  return docRef.id;
};

// Get all crops for the current user
export const getCropsByUserId = async (userId: string): Promise<Crop[]> => {
  const q = query(
    cropsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertDocToCrop);
};

// Get active crops (not completed) for the current user
export const getActiveCrops = async (userId: string): Promise<ActiveCrop[]> => {
  try {
    if (!userId) {
      console.error("getActiveCrops called with empty userId");
      return [];
    }

    console.log("Fetching active crops for user:", userId);

    const q = query(
      cropsCollection,
      where('userId', '==', userId),
      where('status', 'in', ['active', 'ready-to-harvest', 'delayed']),
      orderBy('plantingDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.docs.length} active crops in Firestore`);

    const crops = querySnapshot.docs.map(doc => {
      const crop = convertDocToCrop(doc) as ActiveCrop;
      console.log(`Active crop: ${crop.name}, status: ${crop.status}, id: ${crop.id}`);
      return crop;
    });

    return crops;
  } catch (error) {
    console.error("Error fetching active crops:", error);
    // Re-throw the error to be handled by the React Query retry mechanism
    throw error;
  }
};

// Get upcoming crops for the current user
export const getUpcomingCrops = async (userId: string): Promise<ActiveCrop[]> => {
  try {
    if (!userId) {
      console.error("getUpcomingCrops called with empty userId");
      return [];
    }

    const q = query(
      cropsCollection,
      where('userId', '==', userId),
      where('status', '==', 'upcoming'),
      orderBy('plantingDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocToCrop(doc) as ActiveCrop);
  } catch (error) {
    console.error("Error fetching upcoming crops:", error);
    // Re-throw the error to be handled by the React Query retry mechanism
    throw error;
  }
};

// Get historical crops for the current user
export const getHistoricalCrops = async (userId: string): Promise<HistoricalCrop[]> => {
  try {
    if (!userId) {
      console.error("getHistoricalCrops called with empty userId");
      return [];
    }

    const q = query(
      cropsCollection,
      where('userId', '==', userId),
      where('status', '==', 'completed'),
      orderBy('harvestDate', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => convertDocToCrop(doc) as HistoricalCrop);
  } catch (error) {
    console.error("Error fetching historical crops:", error);
    // Re-throw the error to be handled by the React Query retry mechanism
    throw error;
  }
};

// Get a single crop by ID
export const getCropById = async (cropId: string): Promise<Crop | null> => {
  const docRef = doc(db, 'crops', cropId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return convertDocToCrop(docSnap);
  }

  return null;
};

// Update a crop
export const updateCrop = async (cropId: string, cropData: Partial<Crop>): Promise<void> => {
  console.log(`Updating crop with ID: ${cropId}`);
  console.log('Update data:', cropData);

  const docRef = doc(db, 'crops', cropId);

  // First get the current data to log it
  const currentDoc = await getDoc(docRef);
  if (currentDoc.exists()) {
    console.log('Current crop data:', currentDoc.data());
  } else {
    console.warn(`Crop with ID ${cropId} not found in Firestore`);
  }

  await updateDoc(docRef, {
    ...cropData,
    updatedAt: serverTimestamp(),
  });

  console.log(`Crop ${cropId} updated successfully`);
};

// Delete a crop
export const deleteCrop = async (cropId: string): Promise<void> => {
  const docRef = doc(db, 'crops', cropId);
  await deleteDoc(docRef);
};

// Update crop status
export const updateCropStatus = async (cropId: string, status: CropStatus): Promise<void> => {
  const docRef = doc(db, 'crops', cropId);

  // First get the current data to preserve userId
  const cropDoc = await getDoc(docRef);
  if (!cropDoc.exists()) {
    throw new Error(`Crop with ID ${cropId} not found`);
  }

  const currentData = cropDoc.data();
  console.log('Current crop data before status update:', currentData);

  await updateDoc(docRef, {
    status,
    // Preserve the userId from the current document
    userId: currentData.userId,
    updatedAt: serverTimestamp(),
  });

  console.log(`Successfully updated crop ${cropId} status to ${status}`);
};

// Mark a crop as completed (harvested)
export const markCropAsHarvested = async (
  cropId: string,
  harvestDate: string,
  yieldAmount: string,
  notes: string
): Promise<void> => {
  try {
    if (!cropId) {
      throw new Error("markCropAsHarvested called with empty cropId");
    }

    const docRef = doc(db, 'crops', cropId);

    // First check if the crop exists
    const cropDoc = await getDoc(docRef);
    if (!cropDoc.exists()) {
      throw new Error(`Crop with ID ${cropId} not found`);
    }

    // Get the current data to preserve userId
    const currentData = cropDoc.data();
    console.log('Current crop data before harvest:', currentData);

    await updateDoc(docRef, {
      status: 'completed',
      harvestDate,
      yield: yieldAmount,
      notes,
      // Preserve the userId from the current document
      userId: currentData.userId,
      updatedAt: serverTimestamp(),
    });

    console.log(`Successfully marked crop ${cropId} as harvested`);
  } catch (error) {
    console.error("Error marking crop as harvested:", error);
    throw error;
  }
};

// Add an alert to a crop
export const addCropAlert = async (cropId: string, alert: string): Promise<void> => {
  const cropDoc = await getCropById(cropId);

  if (!cropDoc || isHistoricalCrop(cropDoc)) {
    throw new Error('Cannot add alert to a historical crop');
  }

  const docRef = doc(db, 'crops', cropId);
  const alerts = [...cropDoc.alerts, alert];

  await updateDoc(docRef, {
    alerts,
    updatedAt: serverTimestamp(),
  });
};

// Remove an alert from a crop
export const removeCropAlert = async (cropId: string, alertIndex: number): Promise<void> => {
  const cropDoc = await getCropById(cropId);

  if (!cropDoc || isHistoricalCrop(cropDoc)) {
    throw new Error('Cannot remove alert from a historical crop');
  }

  const docRef = doc(db, 'crops', cropId);
  const alerts = [...cropDoc.alerts];
  alerts.splice(alertIndex, 1);

  await updateDoc(docRef, {
    alerts,
    updatedAt: serverTimestamp(),
  });
};
