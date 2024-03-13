import { text } from "stream/consumers";
import {IInputs, IOutputs} from "./generated/ManifestTypes";

export class HelloWorldPcf implements ComponentFramework.StandardControl<IInputs, IOutputs> {

    //private label: HTMLInputElement;
    //private _container: HTMLDivElement;

    private _context: ComponentFramework.Context<IInputs>;
    
    private container: HTMLDivElement;
    private notifyOutputChaged: () => void;
    private isEditMode: boolean;
    private name: string | null;

    /**
     * Empty constructor.
     */
    constructor()
    {

    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
    {
        // Add control initialization code
        /*
        this.label = document.createElement("input");
        this.label.setAttribute("type", "label");
        this.label.value = "MY FIRST PCF :)";

        this._container = document.createElement("div");
        this._container.appendChild(this.label);

        container.appendChild(this._container);
        */

        this._context = context;
        this.notifyOutputChaged = notifyOutputChanged;
        this.container = container;
        this.isEditMode = false;

        // Create the span element to hold the project name
        const message = document.createElement("span");
        message.innerText = `Project name ${this.isEditMode ? "" : context.parameters.Name.raw}`;

        // Create the textbox to edit the name
        const textbox = document.createElement("input");
        textbox.type = "text";
        textbox.style.display = this.isEditMode ? "block" : "none";

        if(context.parameters.Name.raw){

            textbox.value = context.parameters.Name.raw;

            const messageContainer = document.createElement("div");
            messageContainer.appendChild(message);
            messageContainer.appendChild(textbox);

            const button = document.createElement("button");
            button.textContent = this.isEditMode ? "Save" : "Edit";
            button.addEventListener("click", () => { this.buttonClick(); });

            this.container.appendChild(messageContainer);
            this.container.appendChild(button);
        }
    }

    public buttonClick(){

        // Get our controls via DOM queries
        const textbox = this.container.querySelector("input");
        const message = this.container.querySelector("span");
        const button = this.container.querySelector("button");

        if(!textbox) return;
        if(!message) return;
        if(!button) return;

        // If not in edit mode, copy the current name value to the textbox
        if(!this.isEditMode){

            textbox.value = this.name ?? "";
        }
        else if(textbox?.value != this.name){

            // if in edit mode, copy the textbox value to name and call the notify callback
            this.name = textbox.value;
            this.notifyOutputChaged();
        }

        // flip the mode flag
        this.isEditMode = !this.isEditMode;

        // Set up the new output based on changes
        message.innerText = `Project name ${this.isEditMode ? "" : this.name}`;
        
        textbox.style.display = this.isEditMode ? "inline" : "none";
        textbox.value = this.name ?? "";

        button.textContent = this.isEditMode ? "Save" : "Edit";
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void
    {
        // Checks for updates coming in from outside
        this.name = context.parameters.Name.raw;
        
        const message = this.container.querySelector("span");

        if(!message) return;

        message.innerText = `Project name ${this.name}`;
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
     */
    public getOutputs(): IOutputs
    {
        return {
            // If our name variable is null, return undefined instead
            Name: this.name ?? undefined
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void
    {
        // Add code to cleanup control if necessary
        
        // Remove the event listener we created in init
        this.container.querySelector("button")!.removeEventListener("click", this.buttonClick);
    }
}
