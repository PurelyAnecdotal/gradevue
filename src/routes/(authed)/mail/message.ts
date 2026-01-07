export const srcdoc = (content: string, openNewTabInstruction: string) => `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            html {
                font-family: Inter, sans-serif;
                line-height: 1.5;
            }

            a {
                position: relative;
            }
                
            a::before {
                content: "Open the link in a new tab (${openNewTabInstruction})";
                position: absolute;
                bottom: calc(100% + 0.5rem);
                left: 50%;
                transform: translateX(-50%);
                background-color: #333;
                color: white;
                padding: 0.25rem;
                border-radius: 0.25rem;
                font-size: 0.8rem;
                white-space: normal;
                max-width: 12rem;
                width: max-content;
                text-align: center;
                opacity: 0;
                visibility: hidden;
                transition: opacity 0.2s;
                pointer-events: none;
            }

            a:focus::before,
            a:active::before,
            a:hover::before {
                opacity: 1;
                visibility: visible;
            }
        
        </style>
    </head>
    <body>
        ${content}
    </body>
</html>`;
