import { createContext, useContext, useEffect, useState } from "react";
import socket from "@/lib/socket";

interface Farmer {
  id?: number;
  _id?: string;
  memberNo?: string;
  firstName?: string;
  middleName?: string;
  surname?: string;
  phone?: string;
  email?: string;
  idNumber?: string;
  city?: string;
  status?: string;
  registeredAt?: string;
}

interface FarmersContextType {
  farmers: Farmer[];
  addFarmer: (farmer: Partial<Farmer>) => void;
  refetchFarmers: () => Promise<void>;
}

const FarmersContext = createContext<FarmersContextType | undefined>(undefined);

export function FarmersProvider({ children }: { children: React.ReactNode }) {
  const [farmers, setFarmers] = useState<Farmer[]>([]);

  // Fetch initial farmers from server
  useEffect(() => {
    let cancelled = false;

    const fetchFarmers = async () => {
      try {
        const res = await fetch('/api/farmers');
        if (!res.ok) {
          console.error('Failed to fetch farmers:', res.status);
          return;
        }
        const body = await res.json();
        if (cancelled) return;
        console.log('Loaded', body.farmers?.length || 0, 'farmers from server');
        setFarmers((body.farmers || []).map((f: any) => ({ ...f })));
      } catch (err) {
        console.error('Failed to load farmers', err);
      }
    };

    fetchFarmers();

    // Listen for new farmers via socket
    const onStats = (payload: any) => {
      console.log('Received stats:update event, refetching farmers');
      fetchFarmers();
    };

    socket.on('stats:update', onStats);

    return () => {
      cancelled = true;
      socket.off('stats:update', onStats);
    };
  }, []);

  const addFarmer = (farmerData: Partial<Farmer>) => {
    // add locally; if server returns object, registration page already posts and will navigate
    setFarmers(prev => [...prev, farmerData as Farmer]);
  };

  const refetchFarmers = async () => {
    try {
      const res = await fetch('/api/farmers');
      if (res.ok) {
        const body = await res.json();
        console.log('Refetched', body.farmers?.length || 0, 'farmers');
        setFarmers((body.farmers || []).map((f: any) => ({ ...f })));
      }
    } catch (err) {
      console.error('Failed to refetch farmers', err);
    }
  };

  return (
    <FarmersContext.Provider value={{ farmers, addFarmer, refetchFarmers }}>
      {children}
    </FarmersContext.Provider>
  );
}

export function useFarmers() {
  const context = useContext(FarmersContext);
  if (!context) {
    throw new Error("useFarmers must be used within FarmersProvider");
  }
  return context;
}
