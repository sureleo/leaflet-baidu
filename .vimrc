set nu
filetype plugin on
set pastetoggle=<F9>
set nocompatible
syntax on
autocmd BufRead *.py set smartindent cinwords=if,elif,else,for,while,try,except,finally,def,class
autocmd BufRead *.py set smarttab
autocmd BufRead *.py map <buffer> <S-e> :w<CR>:!/usr/bin/env python %
autocmd BufRead *.py set expandtab
autocmd BufRead *.py set autoindent
autocmd BufRead *.py highlight BadWhitespace ctermbg=red guibg=red
autocmd BufRead *.py match BadWhitespace /^\t\+/
autocmd BufRead *.py match BadWhitespace /\s\+$/

autocmd BufRead *.cpp set autoindent 
autocmd BufRead *.h set autoindent 
"autocmd FileType python set complete+=k~/.vim/syntax/python.vim isk+=.,(
highlight NobreakSpace ctermbg=red guibg=red
match NobreakSpace / /

"if has("autocmd")
"    autocmd FileType python set complete+=k~/.vim/pydiction-1.2/pydiction isk+=.,(
"endif " has("autocmd"

set tabstop=4
set softtabstop=4
set shiftwidth=4
set smarttab
set expandtab
set smartindent


"the status bar is always displayed

set laststatus=2 
if has("statusline")
    set statusline=%<%f%h%m%r%=%l,%c\ %P  
elseif has("cmdline_info")
    set ruler " display cursor position
endif

" desactivate the arrow key in order to force myself
" to only use hjkl
"map <Left> <Esc>                                                                
"map <Down> <Esc>
"map <Up> <Esc>
"map <Right> <Esc>
"imap <Left> <Esc>

"using TAB will complete as much as possible and other tab will display 
" one by one the other possibility
set wildmode=longest,full 

" in order to autocomplete php (and also SQL/HTML embed in it
au FileType php set omnifunc=phpcomplete#CompletePHP
let php_sql_query=1                                                                                        
let php_htmlInStrings=1

"I've never really used them 
set nobackup       "no backup files
set nowritebackup  "only in case you don't want a backup file while editing
set noswapfile     "no swap files

" in order to use the mouse
set mouse=a
  
set autochdir
"
set showcmd
colorscheme torte

execute pathogen#infect()

autocmd BufRead *.js highlight BadWhitespace ctermbg=red guibg=red
autocmd BufRead *.js match BadWhitespace /^\t\+/
autocmd BufRead *.js match BadWhitespace /\s\+$/
