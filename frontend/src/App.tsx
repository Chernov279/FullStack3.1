"use client";

import React, { useState } from "react";
import { BookOpen, ChefHat, Calculator, DollarSign, FileText } from "lucide-react";
import { Button } from "./components/ui/button";
import { Dashboard } from "./components/Dashboard";
import { RecipeManager } from "./components/RecipeManager";
import { FoodCostCalculator } from "./components/FoodCostCalculator";
import { AccountingTracker } from "./components/AccountingTracker";
import { WritingTools } from "./components/WritingTools";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border min-h-screen">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-semibold">Помощник Шефа</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Профессиональное управление кухней
            </p>
          </div>
          
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Панель управления
            </Button>
            <Button
              variant={activeTab === 'recipes' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('recipes')}
            >
              <ChefHat className="mr-2 h-4 w-4" />
              Менеджер рецептов
            </Button>
            <Button
              variant={activeTab === 'costing' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('costing')}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Калькуляция продуктов
            </Button>
            <Button
              variant={activeTab === 'accounting' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('accounting')}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Бухгалтерия
            </Button>
            <Button
              variant={activeTab === 'writing' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('writing')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Инструменты для написания
            </Button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'recipes' && <RecipeManager />}
          {activeTab === 'costing' && <FoodCostCalculator />}
          {activeTab === 'accounting' && <AccountingTracker />}
          {activeTab === 'writing' && <WritingTools />}
        </div>
      </div>
    </div>
  );
}