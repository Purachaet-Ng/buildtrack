import { getMeUser } from "@/api/users.api";
import { useQuery } from "@tanstack/react-query";

export const useUser = () => {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: getMeUser,
  });
};
