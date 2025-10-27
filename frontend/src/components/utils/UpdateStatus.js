// EventStatusUpdater.js
import { useEffect } from "react";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase"; // adjust path as needed

const EventStatusUpdater = () => {
  useEffect(() => {
    const updateStatuses = async () => {
      const now = new Date();
      const eventsRef = collection(db, "events");
      const snapshot = await getDocs(eventsRef);
    
      for (const eventDoc of snapshot.docs) {
        const event = eventDoc.data();
    
        if (event.approval?.status === "approved") {
          const start = event.schedule?.start?.toDate?.() || new Date(event.schedule?.start);
          const end = event.schedule?.end?.toDate?.() || new Date(event.schedule?.end);
    
          let newStatus = "upcoming";
          if (now >= end) {
            newStatus = "completed";
          } else if (now >= start && now < end) {
            newStatus = "ongoing";
          }
    
          if (event.status !== newStatus) {
            await updateDoc(doc(db, "events", eventDoc.id), {
              status: newStatus,
              "schedule.updatedAt": serverTimestamp(),
            });
            console.log(`Updated status of ${event.name} to ${newStatus}`);
          }
        }
      }
    };
    

    // Run once immediately
    updateStatuses();

    // Then every 1 minute
    const interval = setInterval(updateStatuses, 60000);

    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return null; // no UI
};

export default EventStatusUpdater;
