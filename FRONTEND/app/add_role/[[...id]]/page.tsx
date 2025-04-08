/*Author : Matthieu BIVILLE*/

"use client"
import AddUpdateRole from "@/components/role_gestion/AddUpdateRole";
import { useParams } from "next/navigation";

export default function AddUpdateGestion(){
    const param = useParams();

    return(
        <AddUpdateRole roleId={param.id} />
    )
}