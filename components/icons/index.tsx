// components/icons/index.tsx
import { 
  Map, Mountain, Tent, Backpack, Compass, Thermometer, Wind, Droplets, 
  Flame, Utensils, Shirt, BedDouble, Zap, Box, CheckCircle2, X, 
  ChevronRight, ChevronDown, ChevronLeft, Search, Plus, Minus, Trash2, FileText, Share2, Upload,
  User, Settings, LogOut, Train, Plane, Bus, CalendarRange, Activity, 
  ArrowRight, ArrowLeft, CloudSun, Home, TrendingUp, Download, Check,
  Star, Gauge, Clock, Route, MapPin, AlertTriangle, Footprints, Target,
  Package, Layers, Trophy, BookOpen, Archive, Hammer, Sun, Moon, Calendar,
  Bell, Shield, Database, HelpCircle, Eye, Users, BarChart3, Wallet, Globe, Folder
} from "lucide-react";


// Épaisseur de trait pour le look "Technique/Pro"
const TECH_STROKE = 1.5; 

export const Icons = {
  // --- IDENTITÉ ---
  Logo: ({ className }: { className?: string }) => (
    <Mountain strokeWidth={TECH_STROKE} className={className} />
  ),
  Yeti: ({ className }: { className?: string }) => (
    <Mountain strokeWidth={TECH_STROKE} className={className} />
  ),

  // --- NAVIGATION ---
  NavTrek: ({ className }: { className?: string }) => (
    <Map strokeWidth={TECH_STROKE} className={className} />
  ),
  NavBasecamp: ({ className }: { className?: string }) => (
    <Tent strokeWidth={TECH_STROKE} className={className} />
  ),
  NavPack: ({ className }: { className?: string }) => (
    <Backpack strokeWidth={TECH_STROKE} className={className} />
  ),
  NavInventory: ({ className }: { className?: string }) => (
    <Archive strokeWidth={TECH_STROKE} className={className} />
  ),
  NavRoutes: ({ className }: { className?: string }) => (
    <Route strokeWidth={TECH_STROKE} className={className} />
  ),
  NavBuilder: ({ className }: { className?: string }) => (
    <Hammer strokeWidth={TECH_STROKE} className={className} />
  ),
  
  // --- CATÉGORIES MATÉRIEL (Pack Builder) ---
  CatShelter: ({ className }: { className?: string }) => (
    <Tent strokeWidth={TECH_STROKE} className={className} />
  ),
  CatSleep: ({ className }: { className?: string }) => (
    <BedDouble strokeWidth={TECH_STROKE} className={className} />
  ),
  CatCook: ({ className }: { className?: string }) => (
    <Flame strokeWidth={TECH_STROKE} className={className} />
  ),
  CatFood: ({ className }: { className?: string }) => (
    <Utensils strokeWidth={TECH_STROKE} className={className} />
  ),
  CatWater: ({ className }: { className?: string }) => (
    <Droplets strokeWidth={TECH_STROKE} className={className} />
  ),
  CatWear: ({ className }: { className?: string }) => (
    <Shirt strokeWidth={TECH_STROKE} className={className} />
  ),
  CatTech: ({ className }: { className?: string }) => (
    <Zap strokeWidth={TECH_STROKE} className={className} />
  ),
  CatMisc: ({ className }: { className?: string }) => (
    <Box strokeWidth={TECH_STROKE} className={className} />
  ),
  CatNav: ({ className }: { className?: string }) => (
    <Compass strokeWidth={TECH_STROKE} className={className} />
  ),

  // --- DONNÉES & MÉTÉO ---
  StatsDistance: ({ className }: { className?: string }) => (
    <Map strokeWidth={TECH_STROKE} className={className} />
  ),
  StatsElevation: ({ className }: { className?: string }) => (
    <TrendingUp strokeWidth={TECH_STROKE} className={className} />
  ),
  StatsDuration: ({ className }: { className?: string }) => (
    <CalendarRange strokeWidth={TECH_STROKE} className={className} />
  ),
  StatsDifficulty: ({ className }: { className?: string }) => (
    <Activity strokeWidth={TECH_STROKE} className={className} />
  ),
  StatsAltitude: ({ className }: { className?: string }) => (
      <Target strokeWidth={TECH_STROKE} className={className} />
  ),
  Activity: ({ className }: { className?: string }) => (
      <Activity strokeWidth={TECH_STROKE} className={className} />
  ),
  WeatherSun: ({ className }: { className?: string }) => (
    <Thermometer strokeWidth={TECH_STROKE} className={className} />
  ),
  WeatherCloudSun: ({ className }: { className?: string }) => (
    <CloudSun strokeWidth={TECH_STROKE} className={className} />
  ),
  WeatherWind: ({ className }: { className?: string }) => (
    <Wind strokeWidth={TECH_STROKE} className={className} />
  ),
  WeatherRain: ({ className }: { className?: string }) => (
      <Droplets strokeWidth={TECH_STROKE} className={className} />
  ),

  // --- TRANSPORT & LOGISTIQUE ---
  Train: ({ className }: { className?: string }) => (
    <Train strokeWidth={TECH_STROKE} className={className} />
  ),
  Bus: ({ className }: { className?: string }) => (
    <Bus strokeWidth={TECH_STROKE} className={className} />
  ),
  Plane: ({ className }: { className?: string }) => (
    <Plane strokeWidth={TECH_STROKE} className={className} />
  ),
  Home: ({ className }: { className?: string }) => (
    <Home strokeWidth={TECH_STROKE} className={className} />
  ),

  // --- UI GÉNÉRIQUE (Boutons, Actions) ---
  Search: ({ className }: { className?: string }) => (
    <Search strokeWidth={TECH_STROKE} className={className} />
  ),
  Filter: ({ className }: { className?: string }) => (
      <Settings strokeWidth={TECH_STROKE} className={className} />
  ),
  Check: ({ className }: { className?: string }) => (
    <CheckCircle2 strokeWidth={TECH_STROKE} className={className} />
  ),
  SimpleCheck: ({ className }: { className?: string }) => (
    <Check strokeWidth={TECH_STROKE} className={className} />
  ),
  Close: ({ className }: { className?: string }) => (
    <X strokeWidth={TECH_STROKE} className={className} />
  ),
  Plus: ({ className }: { className?: string }) => (
    <Plus strokeWidth={TECH_STROKE} className={className} />
  ),
  PlusCircle: ({ className }: { className?: string }) => (
    <Plus strokeWidth={TECH_STROKE} className={className} />
  ),
  Minus: ({ className }: { className?: string }) => (
    <Minus strokeWidth={TECH_STROKE} className={className} />
  ),
  Trash: ({ className }: { className?: string }) => (
    <Trash2 strokeWidth={TECH_STROKE} className={className} />
  ),
  Save: ({ className }: { className?: string }) => (
      <CheckCircle2 strokeWidth={TECH_STROKE} className={className} />
  ),
  ArrowRight: ({ className }: { className?: string }) => (
    <ArrowRight strokeWidth={TECH_STROKE} className={className} />
  ),
  ArrowLeft: ({ className }: { className?: string }) => (
    <ArrowLeft strokeWidth={TECH_STROKE} className={className} />
  ),
  ChevronRight: ({ className }: { className?: string }) => (
    <ChevronRight strokeWidth={TECH_STROKE} className={className} />
  ),
  ChevronLeft: ({ className }: { className?: string }) => (
      <ChevronLeft strokeWidth={TECH_STROKE} className={className} />
    ),
  ChevronDown: ({ className }: { className?: string }) => (
    <ChevronDown strokeWidth={TECH_STROKE} className={className} />
  ),
  ChevronUp: ({ className }: { className?: string }) => (
      <ChevronDown strokeWidth={TECH_STROKE} className={`rotate-180 ${className}`} />
  ),
  Menu: ({ className }: { className?: string }) => (
      <Settings strokeWidth={TECH_STROKE} className={className} />
  ),
  Share: ({ className }: { className?: string }) => (
    <Share2 strokeWidth={TECH_STROKE} className={className} />
  ),
  File: ({ className }: { className?: string }) => (
    <FileText strokeWidth={TECH_STROKE} className={className} />
  ),
  User: ({ className }: { className?: string }) => (
    <User strokeWidth={TECH_STROKE} className={className} />
  ),
  Settings: ({ className }: { className?: string }) => (
    <Settings strokeWidth={TECH_STROKE} className={className} />
  ),
  Logout: ({ className }: { className?: string }) => (
    <LogOut strokeWidth={TECH_STROKE} className={className} />
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <TrendingUp strokeWidth={TECH_STROKE} className={className} />
  ),
  Download: ({ className }: { className?: string }) => (
    <Download strokeWidth={TECH_STROKE} className={className} />
  ),
  Upload: ({ className }: { className?: string }) => (
    <Upload strokeWidth={TECH_STROKE} className={className} />
  ),
  Star: ({ className }: { className?: string }) => (
    <Star strokeWidth={TECH_STROKE} className={className} />
  ),
  Gauge: ({ className }: { className?: string }) => (
    <Gauge strokeWidth={TECH_STROKE} className={className} />
  ),
  Clock: ({ className }: { className?: string }) => (
    <Clock strokeWidth={TECH_STROKE} className={className} />
  ),
  CheckCircle: ({ className }: { className?: string }) => (
    <CheckCircle2 strokeWidth={TECH_STROKE} className={className} />
  ),
  MapPin: ({ className }: { className?: string }) => (
    <MapPin strokeWidth={TECH_STROKE} className={className} />
  ),
  Info: ({ className }: { className?: string }) => (
      <CheckCircle2 strokeWidth={TECH_STROKE} className={className} />
  ),
  Warning: ({ className }: { className?: string }) => (
    <AlertTriangle strokeWidth={TECH_STROKE} className={className} />
  ),
  Layers: ({ className }: { className?: string }) => (
      <Layers strokeWidth={TECH_STROKE} className={className} />
  ),
  Trophy: ({ className }: { className?: string }) => (
      <Trophy strokeWidth={TECH_STROKE} className={className} />
  ),
  Heart: ({ className }: { className?: string }) => (
      <Star strokeWidth={TECH_STROKE} className={className} />
  ),
  Pelerinage: ({ className }: { className?: string }) => (
    <Footprints strokeWidth={TECH_STROKE} className={className} />
  ),
  Sportif: ({ className }: { className?: string }) => (
    <Target strokeWidth={TECH_STROKE} className={className} />
  ),
  Modere: ({ className }: { className?: string }) => (
      <Footprints strokeWidth={TECH_STROKE} className={className} />
  ),
  Compass: ({ className }: { className?: string }) => (
      <Compass strokeWidth={TECH_STROKE} className={className} />
  ),
  Notebook: ({ className }: { className?: string }) => (
      <BookOpen strokeWidth={TECH_STROKE} className={className} />
  ),
  Map: ({ className }: { className?: string }) => (
      <Map strokeWidth={TECH_STROKE} className={className} />
  ),
  Archive: ({ className }: { className?: string }) => (
    <Archive strokeWidth={TECH_STROKE} className={className} />
  ),
  Zap: ({ className }: { className?: string }) => (
    <Zap strokeWidth={TECH_STROKE} className={className} />
  ),
  CloudSun: ({ className }: { className?: string }) => (
    <CloudSun strokeWidth={TECH_STROKE} className={className} />
  ),
  Backpack: ({ className }: { className?: string }) => (
    <Backpack strokeWidth={TECH_STROKE} className={className} />
  ),
  Route: ({ className }: { className?: string }) => (
    <Route strokeWidth={TECH_STROKE} className={className} />
  ),
  Sun: ({ className }: { className?: string }) => (
    <Sun strokeWidth={TECH_STROKE} className={className} />
  ),
  Moon: ({ className }: { className?: string }) => (
    <Moon strokeWidth={TECH_STROKE} className={className} />
  ),
  Calendar: ({ className }: { className?: string }) => (
    <Calendar strokeWidth={TECH_STROKE} className={className} />
  ),
  Bell: ({ className }: { className?: string }) => (
    <Bell strokeWidth={TECH_STROKE} className={className} />
  ),
  Shield: ({ className }: { className?: string }) => (
    <Shield strokeWidth={TECH_STROKE} className={className} />
  ),
  Database: ({ className }: { className?: string }) => (
    <Database strokeWidth={TECH_STROKE} className={className} />
  ),
  HelpCircle: ({ className }: { className?: string }) => (
    <HelpCircle strokeWidth={TECH_STROKE} className={className} />
  ),
  Eye: ({ className }: { className?: string }) => (
    <Eye strokeWidth={TECH_STROKE} className={className} />
  ),
  Users: ({ className }: { className?: string }) => (
    <Users strokeWidth={TECH_STROKE} className={className} />
  ),
  BarChart: ({ className }: { className?: string }) => (
    <BarChart3 strokeWidth={TECH_STROKE} className={className} />
  ),
  Wallet: ({ className }: { className?: string }) => (
    <Wallet strokeWidth={TECH_STROKE} className={className} />
  ),
  AlertTriangle: ({ className }: { className?: string }) => (
    <AlertTriangle strokeWidth={TECH_STROKE} className={className} />
  ),
  Globe: ({ className }: { className?: string }) => (
    <Globe strokeWidth={TECH_STROKE} className={className} />
  ),
  Folder: ({ className }: { className?: string }) => (
    <Folder strokeWidth={TECH_STROKE} className={className} />
  ),
};

export default Icons;