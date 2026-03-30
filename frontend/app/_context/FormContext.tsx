'use client';
import { createContext, ReactNode, useContext, useState } from "react";

interface FormData {
    organization: string;
    city: string;
    state: string;
    country: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

interface FormContextType {
    formData: FormData;
    updateData: (newData: Partial<FormData>) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

export const FormProvidor = ({children}: { children: ReactNode}) => {
    const [formData, setFormData] = useState({
        organization: '',
        city: '',
        state: '',
        country: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    })

    const updateData = (newData: Partial<FormData>) => setFormData(
        prev => ({ ...prev, ...newData})
    );

    return (
        <FormContext.Provider value={{ formData, updateData}}>
            {children}
        </FormContext.Provider>
    )
}

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error("useFormContext must be used wihtin a FormProvidor");
    }
    return context;
}