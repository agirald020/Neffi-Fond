import React, { Suspense } from "react";
import { Route, Switch } from "wouter";
import NotFound from "@/shared/pages/NotFound";
import Layout from "@/shared/components/Layout";
import HomePage from "@/features/homePage/HomePage";
import FindNamePage from "@/features/findName.tsx/FindNamePage";
import NewNamePage from "@/features/newName/NewNamePage";

const Router: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando...</div>}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/buscar-fideicomiso" component={FindNamePage} />
          <Route path="/crear-nombre-fideicomiso" component={NewNamePage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

export default Router;