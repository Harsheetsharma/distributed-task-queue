import { atom } from "recoil";

export const JobsId = atom<string | null>({
    key: 'JobId',
    default: " "
})