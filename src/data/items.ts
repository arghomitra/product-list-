export type Item = {
  id: string;
  name: string;
};

const itemNames: string[] = [
    "stella (12 pack) 33cl", "stella (6 pack) 33cl", "stella (24 pack) 33cl", "stella 50cl",
    "jupiler 50cl", "jupiler (6 pack) 33cl", "jupiler (24 pack) 33cl", "carapils 33cl", 
    "carapils 50cl", "somersby apple 50cl", "somersby berry 50cl", "somersby mango 50cl", 
    "lech", "zuber", "perla black", "perla green", "perla yellow", "warka red", "warka black", 
    "maes 50cl", "kastel roues", "kastel robuse", "kasbarg", "zwywic", "tyskie", "leffe bruin", 
    "leffe blonde", "gordon green", "gordon blue", "gordon 14 carbon", "gordon 12 platinum", 
    "gordon gold", "gordon gold 33cl", "gordon red", "heineken 50cl", "desparados original" ,"desparados mojito","heineken 33cl", 
    "heineken 0% alc", "caprisun cherry", "caprisun orange", "caprisun multi", "caprisun big", 
    "red bull original 25cl", "redbull original 350ml", "redbull big", "red bull red", 
    "red bull pink", "red bull green", "red bull blue", "red bull white", "red bull lite", 
    "red bull light-blue", "red bull yellow", "nalu green normal", "tropico", "schewepes yellow", 
    "schewepes red", "schewepes mojito", "colla vanila 33cl", "colla cheery 33cl", 
    "fanta cassic 33cl", "fanta strwberry 33cl", "fanta lemon 33cl", "fanta exotic 33cl", 
    "sprite 33cl", "lipton green 33cl", "lipton pech 33cl", "lipton original 33cl", 
    "ginger beer 33cl", "fanta orange 33cl", "canda dry", "pepsi 33cl", "dr. peper 33cl", 
    "coffee capicinu", "coffee late", "cola zero 33cl", "cola normal 33cl", "cola zero 50cl", 
    "cola normal 50cl", "cola zero 1.5 L", "cola normal 1.5L", "aquaries red", "aaquaris blue", 
    "aquaris yellow", "aquaris white", "fanta lemon 50cl", "fanta orange 50cl", "sprite 50cl", 
    "pepsi 50cl", "lipton green 50cl", "lipton pech 50cl", "lipton original blue 50cl", 
    "lipton sparkeline 50cl", "aquaris zero 50cl", "maaza guava 50cl", "maaza mango 50cl", 
    "maaza tropical 50cl", "aloe watermelon", "aloe strawberry", "aloe pomogrenetaloe original green", 
    "maaza mango 1L", "maaza guava 1L", "maaza tropical 1L", "maaza banana 1L", "maaza lichy 1L", 
    "maaza lichy 50cl", "oasis 33cl", "orizona 33cl", "tropico 33cl", "oasis 2L", "AA drinks small", 
    "AA drinks big", "fanta original 1.5L", "fanta lemon 1.5L", "fanta exotic 1.5L", "pepsi 1.5L", 
    "lipton green 1.5L", "lipton pech 1.5L", "lipton original 1.5L", "evion 50cl", "evion 1.5L", 
    "spa normal 50cl", "spa normal 1.5L", "spa red 1.5L", "spa red 50cl", "chaudfontaine normal 50cl", 
    "monster blue", "monster green", "monster original", "monster white", "monster pink", 
    "monster mango",
    "Bombay gin", "girdon gin", "bacardi cola", "bacardi razz", "captain morgan", "captain morgan mojito", 
    "j&b", "erristoff red", "erristoff blue", "bacardi lemonade", "captain morgan cola", "Williams lawsons", 
    "passoa"
];

export const initialItems: Item[] = itemNames.map((name, index) => ({
    id: `item-${index + 1}`,
    name,
}));
