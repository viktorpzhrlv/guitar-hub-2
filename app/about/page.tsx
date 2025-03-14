import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold md:text-4xl">About Guitar Hub</h1>
        <p className="mt-4 text-muted-foreground">
          Your ultimate destination for premium guitars and musical equipment
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="mt-4 text-muted-foreground">
            Guitar Hub was founded in 2010 by a group of passionate musicians who were frustrated with the lack of
            quality instruments and personalized service in the market. What started as a small shop in a garage has
            grown into one of the most trusted names in musical instruments.
          </p>
          <p className="mt-4 text-muted-foreground">
            Our mission is simple: to provide musicians of all levels with high-quality instruments, expert advice, and
            exceptional service. We believe that the right instrument can inspire creativity and help musicians express
            themselves in ways nothing else can.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image src="/images/about-store.jpg" alt="Guitar Hub store" fill className="object-cover" />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold">Our Values</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Passion for Music</h3>
            <p className="mt-2 text-muted-foreground">
              We're musicians first. Our team is made up of players who understand the importance of finding the perfect
              instrument.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Quality Guarantee</h3>
            <p className="mt-2 text-muted-foreground">
              We personally test and inspect every instrument before it reaches our customers to ensure the highest
              quality.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3 w-fit">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Expert Knowledge</h3>
            <p className="mt-2 text-muted-foreground">
              Our team has decades of combined experience and can provide guidance on everything from beginner guitars
              to vintage collectibles.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold">Meet Our Team</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Alex Johnson",
              role: "Founder & CEO",
              image: "/images/team-1.jpg",
              bio: "Professional guitarist with 20+ years of experience",
            },
            {
              name: "Sarah Williams",
              role: "Head of Product",
              image: "/images/team-2.jpg",
              bio: "Former luthier with a passion for acoustic guitars",
            },
            {
              name: "Michael Chen",
              role: "Customer Experience",
              image: "/images/team-3.jpg",
              bio: "Music educator and electric guitar specialist",
            },
            {
              name: "Jessica Rodriguez",
              role: "Marketing Director",
              image: "/images/team-4.jpg",
              bio: "Bass player and digital marketing expert",
            },
          ].map((member, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative h-40 w-40 overflow-hidden rounded-full">
                <Image src="/placeholder.svg" alt={member.name} fill className="object-cover" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-primary">{member.role}</p>
              <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-lg bg-muted p-8 text-center">
        <h2 className="text-2xl font-bold">Ready to Find Your Perfect Guitar?</h2>
        <p className="mt-4 text-muted-foreground">
          Browse our collection of premium instruments or contact us for personalized recommendations.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild>
            <Link href="/category/electric">Shop Now</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

