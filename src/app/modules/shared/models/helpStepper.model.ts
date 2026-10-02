export interface HelpStepper {
    title: string;
    image?: string;
    description?: string;
    itemListDescription?: string[];
    itemTextDescription?: string[];
    itemDescriptionAditional?: string[];
    itemList?: any[];
    children?: HelpStepper[];
}
