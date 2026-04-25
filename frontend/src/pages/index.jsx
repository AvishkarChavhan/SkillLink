import Image from "next/image";

import { useRouter } from "next/router";
import Styles from "../styles/home.module.css"
import UserLayout from "@/layout/userLayout";


export default function Home() {



  const router=useRouter();
   
  return (
    <UserLayout>
    <div className={Styles.container}>
      <div className={Styles.mainContainer}>
        <div className={Styles.mainContainer_left}>
          <p>Make real friends, not just loud followers.</p>
          <p>Where real connections grow without the clutter..</p>
          <div  onClick={()=>{
            router.push("/login")
          }} className={Styles.buttonJoin}>
            <p>Explore</p>
          </div>
        </div>
        <div className={Styles.mainContainer_right}>
          <img src="./images/network_img.webp" alt="newtwork image" />
        </div>
      </div>
    </div>

    </UserLayout>
  );
}