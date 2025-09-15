import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import SocialProof from '@/components/SocialProof';
import HowItWorks from '@/components/HowItWorks';
import BeforeAndAfter from '@/components/BeforeAndAfter';
import Services from '@/components/Services';
import Guarantee from '@/components/Guarantee';
import Faq from '@/components/Faq';
import FinalCta from '@/components/FinalCta';
import TrustedBy from '@/components/TrustedBy';
import ResumeGrader from '@/components/ResumeGrader';
import { usePageTracking } from '@/hooks/usePageTracking';

const HomePage = () => {
  usePageTracking('/');
  return (
    <>
      <Helmet>
        <title>ProResume Designs - Professional Resume Writing Services</title>
        <meta name="description" content="Transform your career with our professional resume writing services. Increase your interview chances with expertly crafted resumes that stand out to employers." />
        <meta property="og:title" content="ProResume Designs - Professional Resume Writing Services" />
        <meta property="og:description" content="Transform your career with our professional resume writing services. Increase your interview chances with expertly crafted resumes that stand out to employers." />
      </Helmet>
      <div className="">
        <Hero />
      </div>
      <SocialProof />
      <ResumeGrader />
      <HowItWorks />
      <BeforeAndAfter />
      <Services />
      <Guarantee />
      <TrustedBy />
      <Faq />
      <FinalCta />
    </>
  );
};

export default HomePage;