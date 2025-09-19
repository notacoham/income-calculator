import Calculator from "../../components/Calculator/Calculator";

const Home = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mx-auto text-center">
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
