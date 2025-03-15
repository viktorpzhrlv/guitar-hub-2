import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold md:text-4xl">За Guitar Hub</h1>
        <p className="mt-4 text-muted-foreground">
          Вашата крайна дестинация за висококачествени китари и музикално оборудване
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold">Нашата История</h2>
          <p className="mt-4 text-muted-foreground">
            Guitar Hub е основан през 2010 г. от група страстни музиканти, които бяха разочаровани от липсата на
            качествени инструменти и персонализирано обслужване на пазара. Това, което започна като малък магазин в гараж,
            се превърна в едно от най-доверените имена в музикалните инструменти.
          </p>
          <p className="mt-4 text-muted-foreground">
            Нашата мисия е проста: да предоставим на музикантите от всички нива висококачествени инструменти, експертни съвети и
            изключително обслужване. Вярваме, че правилният инструмент може да вдъхнови творчеството и да помогне на музикантите да изразят
            себе си по начини, по които нищо друго не може.
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image src="/images/about-store.jpg" alt="Guitar Hub магазин" fill className="object-cover" />
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold">Нашите Ценности</h2>
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
            <h3 className="text-xl font-semibold">Страст към Музиката</h3>
            <p className="mt-2 text-muted-foreground">
              Ние сме първо музиканти. Нашият екип се състои от изпълнители, които разбират важността на намирането на перфектния
              инструмент.
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
            <h3 className="text-xl font-semibold">Гаранция за Качество</h3>
            <p className="mt-2 text-muted-foreground">
              Ние лично тестваме и проверяваме всеки инструмент, преди да достигне до нашите клиенти, за да осигурим най-високо
              качество.
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
            <h3 className="text-xl font-semibold">Експертни Знания</h3>
            <p className="mt-2 text-muted-foreground">
              Нашият екип има десетилетия комбиниран опит и може да предостави насоки за всичко - от китари за начинаещи
              до винтидж колекционерски екземпляри.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-center text-2xl font-bold">Запознайте се с Нашия Екип</h2>
        <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Александър Йорданов",
              role: "Основател и Изпълнителен директор",
              image: "/images/team-1.jpg",
              bio: "Професионален китарист с над 20 години опит",
            },
            {
              name: "Сара Иванова",
              role: "Ръководител Продукти",
              image: "/images/team-2.jpg",
              bio: "Бивш лютиер със страст към акустичните китари",
            },
            {
              name: "Михаил Ченев",
              role: "Клиентско Преживяване",
              image: "/images/team-3.jpg",
              bio: "Музикален педагог и специалист по електрически китари",
            },
            {
              name: "Жесика Родригес",
              role: "Маркетинг Директор",
              image: "/images/team-4.jpg",
              bio: "Басист и експерт по дигитален маркетинг",
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
        <h2 className="text-2xl font-bold">Готови ли сте да Намерите Вашата Перфектна Китара?</h2>
        <p className="mt-4 text-muted-foreground">
          Разгледайте нашата колекция от премиум инструменти или се свържете с нас за персонализирани препоръки.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Button asChild>
            <Link href="/category/electric">Пазарувай Сега</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Свържи се с Нас</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
