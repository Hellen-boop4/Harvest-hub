import { createContext, useContext, useState } from "react";

interface Farmer {
  id: number;
  memberNo: string;
  firstName: string;
  middleName: string;
  surname: string;
  phone: string;
  email: string;
  idNumber: string;
  city: string;
  status: string;
  dateAdded: string;
}

interface FarmersContextType {
  farmers: Farmer[];
  addFarmer: (farmer: Omit<Farmer, "id" | "dateAdded">) => void;
}

const FarmersContext = createContext<FarmersContextType | undefined>(undefined);

export function FarmersProvider({ children }: { children: React.ReactNode }) {
  const [farmers, setFarmers] = useState<Farmer[]>([
    { id: 1, memberNo: "FM001", firstName: "John", middleName: "", surname: "Kamau", phone: "0712345678", email: "john@example.com", idNumber: "12345678", city: "Kiambu", status: "active", dateAdded: "2025-11-01" },
    { id: 2, memberNo: "FM002", firstName: "Mary", middleName: "", surname: "Wanjiku", phone: "0723456789", email: "mary@example.com", idNumber: "23456789", city: "Nyeri", status: "active", dateAdded: "2025-11-02" },
    { id: 3, memberNo: "FM003", firstName: "David", middleName: "", surname: "Omondi", phone: "0734567890", email: "david@example.com", idNumber: "34567890", city: "Kisumu", status: "active", dateAdded: "2025-11-03" },
    { id: 4, memberNo: "FM004", firstName: "Sarah", middleName: "", surname: "Akinyi", phone: "0745678901", email: "sarah@example.com", idNumber: "45678901", city: "Siaya", status: "active", dateAdded: "2025-11-04" },
  ]);

  const addFarmer = (farmerData: Omit<Farmer, "id" | "dateAdded">) => {
    const newFarmer: Farmer = {
      ...farmerData,
      id: Math.max(...farmers.map(f => f.id), 0) + 1,
      dateAdded: new Date().toISOString().split('T')[0],
    };
    setFarmers([...farmers, newFarmer]);
  };

  return (
    <FarmersContext.Provider value={{ farmers, addFarmer }}>
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
