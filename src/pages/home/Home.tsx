import Calculator from "../../components/Calculator/Calculator";

const Home = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mx-auto text-center font-serif italic text-brand-4 dark:text-brand-2">
          Income Calculator
        </h1>
      </header>
      <section className="flex justify-center">
        <Calculator />
      </section>
    </main>
  );
};

export default Home;
