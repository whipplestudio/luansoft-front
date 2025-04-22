# Documentación Luenser

Este repositorio contiene la documentación del sistema de gestión fiscal de Luenser, generada con MkDocs.

## Requisitos

- Python 3.6 o superior
- pip (gestor de paquetes de Python)

## Instalación

1. Clone este repositorio:
   \`\`\`
   git clone https://github.com/luenser/documentacion.git
   cd documentacion
   \`\`\`

2. (Opcional) Cree un entorno virtual:
   \`\`\`
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   \`\`\`

3. Instale las dependencias:
   \`\`\`
   pip install -r requirements.txt
   \`\`\`

## Uso

### Servidor de desarrollo

Para iniciar el servidor de desarrollo y previsualizar la documentación:

\`\`\`
mkdocs serve
\`\`\`

Luego, abra su navegador en `http://127.0.0.1:8000/`

### Construir el sitio estático

Para generar los archivos HTML estáticos:

\`\`\`
mkdocs build
\`\`\`

Los archivos se generarán en el directorio `site/`.

## Estructura del Proyecto

\`\`\`
documentacion/
├── docs/                  # Archivos Markdown de la documentación
│   ├── assets/            # Recursos estáticos (imágenes, CSS)
│   ├── index.md           # Página principal
│   ├── roles/             # Documentación específica por roles
│   └── modulos/           # Documentación de módulos del sistema
├── mkdocs.yml             # Configuración de MkDocs
└── README.md              # Este archivo
\`\`\`

## Contribuir

Para contribuir a la documentación:

1. Cree una rama para sus cambios
2. Realice sus modificaciones
3. Envíe un pull request

## Licencia

Propiedad de Luenser. Todos los derechos reservados.
\`\`\`

```txt file="requirements.txt"
mkdocs==1.5.3
mkdocs-material==9.4.6
pymdown-extensions==10.3
mkdocs-minify-plugin==0.7.1
