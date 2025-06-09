import React from 'react';
import { useEffect } from "react";
import Cookies from "js-cookie";
import Navbar from '../components/layout/Navbar';
import Hero from '../components/sections/Hero';
import About from '../components/sections/About';
import Courses from '../components/sections/Courses';
import Registration from '../components/sections/Registration';
import Consultation from '../components/sections/Consultation';
import OpeningSchedule from '../components/sections/OpeningSchedule';
import Footer from '../components/layout/Footer';
import styles from './Home.module.scss';

const Home = () => {

  useEffect(() => {
    Cookies.remove("isLoggedIn");
    Cookies.remove("userId");
    Cookies.remove("name");
    Cookies.remove("role");
    sessionStorage.clear();
  }, []);
  
  return (
    <div className={styles.homePage}>
      <Navbar />
      <Hero />
      <About />
      <Courses />
      <OpeningSchedule />
      <Registration />
      <Consultation />
      <Footer />
    </div>
  );
};

export default Home;