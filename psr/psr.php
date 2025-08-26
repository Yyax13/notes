<?php

// PSR-12: Se usar strict_types, ele deve vir imediatamente após a tag de abertura
declare(strict_types=1);

// PSR-1: O arquivo deve estar em UTF-8 sem BOM (Byte Order Mark)

// PSR-12: Namespace deve estar em sua própria linha, seguido por uma linha em branco
namespace App\Model;

// PSR-12: Cada "use" deve estar em linha separada e vir depois do namespace
use DateTime;
use Exception;

// PSR-1: Nome de classe deve usar StudlyCaps (também conhecido como PascalCase)
// PSR-12: A chave de abertura da classe deve ficar na linha de baixo
class User
{
    // PSR-12: Visibilidade explícita (`private`, `protected`, `public`)
    private string $name;
    private DateTime $birthDate;

    // PSR-1: Nomes de métodos devem usar camelCase
    // PSR-12: Tipar os parâmetros e o retorno sempre que possível
    //         A chave de abertura do método deve estar na linha seguinte
    public function __construct(string $name, string $birthDate)
    {
        $this->name = $name;

        // PSR-12: Espaços ao redor do operador de atribuição (=)
        //         Preferência por código claro e legível
        $this->birthDate = new DateTime($birthDate);
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getAge(): int
    {
        $today = new DateTime();

        // PSR-12: Espaço entre palavras-chave e parênteses
        // PSR-12: Espaço após vírgulas, sem espaço antes
        $age = $today->diff($this->birthDate)->y;

        return $age;
    }

    public function printUserInfo(): void
    {
        echo "Nome: {$this->getName()}\n";
        echo "Idade: {$this->getAge()} anos\n";
    }
}
