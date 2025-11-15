import { atom } from "recoil";

export const JobsId = atom<string | null>({
    key: 'JobId',
    default: " ",
    effects: [
        ({ setSelf, onSet }) => {
            //1. load from localstorage on initialization
            const storedValue = typeof window !== "undefined" ? localStorage.getItem("JobId") : null;
            if (storedValue) {
                setSelf(storedValue);
            }
            //2. persist to localStorage on change
            onSet((newValue) => {
                if (newValue) {
                    localStorage.setItem("JobId", newValue);
                }
                else localStorage.removeItem("JobId");
            })
        }
    ]
})