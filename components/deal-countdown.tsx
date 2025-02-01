"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

// static target date (replace with desired date)
const TARGET_DATE = new Date("2025-02-20T00:00:00");

// function to calculate time remaining
const calculateTimeRemaining = (targetDate: Date) => {
  const curTime = new Date();

  const timeDiff = Math.max(Number(targetDate) - Number(curTime), 0);

  return {
    days: Math.floor(timeDiff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((timeDiff % (1000 * 60)) / 1000),
  };
};

const DealCountDown = () => {
  const [time, setTimee] =
    useState<ReturnType<typeof calculateTimeRemaining>>();

  useEffect(() => {
    // Calculate initial time on client
    setTimee(calculateTimeRemaining(TARGET_DATE));

    const timerInterval = setInterval(() => {
      const newTime = calculateTimeRemaining(TARGET_DATE);
      setTimee(newTime);
      if (
        newTime.days === 0 &&
        newTime.hours === 0 &&
        newTime.minutes === 0 &&
        newTime.seconds === 0
      ) {
        clearInterval(timerInterval);
      }
      return () => clearInterval(timerInterval);
    }, 1000);
  }, []);

  if (!time)
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-2">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Loading countdown...</h3>
        </div>
      </section>
    );

  if (
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0
  ) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 my-2">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Deal Has Ended</h3>
          <p>
            This deal is no longer available. Check out our latest promotions!
          </p>
          <div className="text-center">
            <Button asChild>
              <Link href={`/search`}>View products</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Image
            src={"/images/promo.jpg"}
            alt={"Promotion"}
            width={300}
            height={200}
          />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-2 my-2">
        <div className="flex flex-col gap-2 justify-center">
          <h3 className="text-3xl font-bold">Deal of The Month</h3>
          <p>
            Get ready for ahipping experience like never before with our deals
            of the Month! Every purchase comes with exclusive perks and offers,
            making this month a celebration of savy choices and amazing deals.
            Dont&apos;t miss out!
          </p>
          <ul className="grid grid-cols-4">
            <StackBox label="Days" value={time.days} />
            <StackBox label="Hours" value={time.hours} />
            <StackBox label="Minutes" value={time.minutes} />
            <StackBox label="Seconds" value={time.seconds} />
          </ul>
          <div className="text-center">
            <Button asChild>
              <Link href={`/search`}>View products</Link>
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <Image
            src={"/images/promo.jpg"}
            alt={"Promotion"}
            width={300}
            height={200}
          />
        </div>
      </section>
    </>
  );
};

const StackBox = ({ label, value }: { label: string; value: number }) => {
  return (
    <li className="p-4 w-full text-center">
      <p className="text-3xl font-bold">{value}</p>
      <p>{label}</p>
    </li>
  );
};

export default DealCountDown;
