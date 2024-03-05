import * as React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import { About } from "./pages/About";
import { Mitigation } from "./pages/Mitigation";
import { CombatLog } from "./pages/CombatLog";
import { CombatLogs } from "./pages/CombatLogs";
import { CombatLogNew } from "./combatlog/components/CombatLog";
import { Simulator } from "./pages/Simulator";
import { OriginSector } from "./pages/OriginSector";
import { Leslie } from "./pages/Leslie";
import { GameMechanics } from "./pages/GameMechanics";
import { Scrapping } from "./pages/Scrapping";
import { HostilesByHhp } from "./pages/HostilesByHhp";

const queryClient = new QueryClient();

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Mitigation />} />
          <Route path="/mitigation" element={<Mitigation />} />
          <Route path="/combatlogs/:id" element={<CombatLog />} />
          <Route path="/combatlogs" element={<CombatLogs />} />
          <Route path="/combatlog" element={<CombatLogNew />} />
          <Route path="/about" element={<About />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/origin-sector" element={<OriginSector />} />
          <Route path="/leslie" element={<Leslie />} />
          <Route path="/scrapping" element={<Scrapping />} />
          <Route path="/game-mechanics" element={<GameMechanics />} />
          <Route path="/armada-bug" element={<GameMechanics />} />
          <Route path="/spock-bug" element={<GameMechanics />} />
          <Route path="/armada-duplicate-officers" element={<GameMechanics />} />
          <Route path="/hostiles-by-hhp" element={<HostilesByHhp />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
