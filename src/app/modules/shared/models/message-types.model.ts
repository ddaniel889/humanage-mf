/* eslint-disable @typescript-eslint/no-explicit-any */
import { HelpStepper } from './helpStepper.model';
export enum MessageType {
    TextAreaYesNo= 0,
    YesNo = 1,
    YesNoCancel = 2,
    OkCancel = 3,
    Info = 4,
    HelpStepper = 5,
    HelpIndex = 6,
    CaptchaNumbers = 7,
    SpanMsg = 8,
    MultipleActions = 9,
    ApproveReject = 10,
    ExportCancel = 11,
    CancelLeave = 12,
    Assign = 13
}

export interface MessageAtributtes {
    bodyText: string;
    infoText?: string;
    valueText?: string;
    placeHolder?:string;
    inputLabel?:string;
    inputHint?:string;
    type: MessageType;
    helpModel?: HelpStepper[];
    actions?: any[];
    candidate?:boolean;
    buttonText?:string;
    firstOption?:string;
    secondOption?:string;
    approve?: any;
}
