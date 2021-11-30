// File: amici.c
// Description: A project for Mechanics of Programming.
// 		Lets the user build a network of friends using various commands:
//		
//		add first-name last-name handle
//		friend handle1 handle2
//		init
//		print handle
//		quit
//		size handle
//		stats
//		unfriend handle1 handle2
//
// Each "user" has a first name, last name, and a handle.
//
// @author Julian Heuser

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

#include "hash.h"
#include "table.h"

//Maximum amount of characters to read from user input
#define MAX_INPUT 1024
//How many friends until we reallocate to bigger space
#define FRIEND_QUOTA 10

typedef struct person_s{
    char *first_name;
    char *last_name;
    char *handle;
    struct person_s **friends;
    size_t friend_count;
    size_t max_friends;
} person_t;

static Table users;
static size_t user_count = 0;
static size_t friend_count = 0;


/// l_ptr_str_print interprets key, value pair as (long*, c-string) types.
/// @param key interpreted as a pointer to a long key value
/// @param value interpreted as a pointer to a c-string value
/// @pre both key and value must be non-NULL, heap-allocated items.
static void str_pptr_print( const void* key, const void* value) {
    printf( "%s : %s", (char*)key, ((person_t*)value)->first_name);
}

/// delete_l_ptr_str deletes an entry of type long*,char* pair.
/// @param key interpreted as a pointer to a long key value
/// @param value interpreted as a pointer to a c-string value
/// @pre both key and value must be non-NULL, heap-allocated items.
/// @post both key and value are invalid
static void delete_str_pptr( void* key, void* value ) {
    //Ignore unused paramter error
    (void)key;

    person_t* person = (person_t*)value;

    free(person->first_name);
    free(person->last_name);
    free(person->handle);
    free(person->friends);
    free(value);
}

/// init removes all users and friendships
///
/// @params             string array of paramters
static void init(char* params[]){
    //Ignore unused paramter error
    (void)params;

    ht_destroy(users);
    users = ht_create(str_hash, str_equals, str_pptr_print, delete_str_pptr);
    user_count = 0;
    friend_count = 0;
    printf("system reinitialized\n");
}

/// add adds a user to the network
///
/// @param params   string array of parameters: first-name last-name handle
/// @pre            the names and handle must be non-null and non-empty
static void add(char* params[]){
    if(ht_has(users, params[2])){
        fprintf(stderr, "error: handle '%s' is already taken.  Try another handle.\n", params[2]);
        return;
    }

    person_t* person = malloc(sizeof(person_t));

    person->first_name = malloc(strlen(params[0]) + 1);
    strcpy(person->first_name, params[0]);

    person->last_name = malloc(strlen(params[1]) + 1);
    strcpy(person->last_name, params[1]);

    person->handle = malloc(strlen(params[2]) + 1);
    strcpy(person->handle, params[2]);

    person->friend_count = 0;
    person->max_friends = FRIEND_QUOTA;

    person->friends = malloc(sizeof(void*) * FRIEND_QUOTA);
    user_count++;
    ht_put(users, (void*)(person->handle), (void*)person);
}

/// print shows information on a specified user
///
/// @param params   string array of parameters: handle
/// @pre            both handles must be non-null and non-empty
static void print(char* params[]){
    if(!ht_has(users, params[0])){
        fprintf(stderr, "error: '%s' is not a known handle\n", params[0]);
        return;
    }

    person_t* person = (person_t*)ht_get(users, params[0]);

    if(person->friend_count == 0){
        printf("User %s %s ('%s') has no friends\n", person->first_name,
            person->last_name, person->handle);
        return;
    }
    else if(person->friend_count == 1){
        printf("User %s %s ('%s') has %zu friend\n", person->first_name,
            person->last_name, person->handle, person->friend_count);
    }
    else{
        printf("User %s %s ('%s') has %zu friends\n", person->first_name,
            person->last_name, person->handle, person->friend_count);
    }

    for(size_t i = 0; i < person->friend_count; i++){
        printf("\t%s %s ('%s')\n", person->friends[i]->first_name,
            person->friends[i]->last_name, person->friends[i]->handle);
    }
}

/// friend friends two users on the network
///
/// @param params   string array of parameters: handle1 handle2
/// @pre            the handle must be non-null and non-empty
static void friend(char* params[]){
    if(!ht_has(users, params[0])){
        fprintf(stderr, "error: '%s' is not a known handle\n", params[0]);
        return;
    }
    if(!ht_has(users, params[1])){
        fprintf(stderr, "error: '%s' is not a known handle\n", params[1]);
        return;
    }
    if(strcmp(params[0], params[1]) == 0){
        fprintf(stderr, "error: user '%s' cannot be friends with self\n", params[0]);
        return;
    }

    person_t* person_1 = (person_t*)ht_get(users, params[0]);
    person_t* person_2 = (person_t*)ht_get(users, params[1]);

    for(size_t i = 0; i < person_1->friend_count; i++){
        if(person_1->friends[i]->handle == person_2->handle){
            fprintf(stderr, "error: '%s' and '%s' are already friends.\n", params[0], params[1]);
            return;
        }
    }

    if(person_1->friend_count + 1 >= person_1->max_friends){
        person_1->max_friends += FRIEND_QUOTA;
        void* p = realloc(person_1->friends, sizeof(void*) * person_1->max_friends);
        if(p == NULL){
            perror("Error expanding friends list! Memory leak possible!");
        }
        else{
            person_1->friends = p;
        }
    }
    if(person_2->friend_count + 1 >= person_2->max_friends){
        person_2->max_friends += FRIEND_QUOTA;
        void* p = realloc(person_2->friends, sizeof(void*) * person_2->max_friends);
        if(p == NULL){
            perror("Error expanding friends list! Memory leak possible!");
        }
        else{
            person_2->friends = p;
        }
    }

    friend_count++;
    person_1->friends[person_1->friend_count++] = person_2;
    person_2->friends[person_2->friend_count++] = person_1;

    printf("%s and %s are now friends\n", person_1->handle, person_2->handle);
}

/// size displays the amount of friends a user has
///
/// @param params   string array of parameters: handle
/// @pre            the handle must be non-null and non-empty
static void size(char* params[]){
    if(!ht_has(users, params[0])){
        fprintf(stderr, "error: '%s' is not a known handle\n", params[0]);
        return;
    }

    person_t* person = (person_t*)ht_get(users, params[0]);

    if(person->friend_count == 1){
        printf("User %s %s ('%s') has %zu friend\n", person->first_name,
            person->last_name, person->handle, person->friend_count);
    }
    else{
        printf("User %s %s ('%s') has %zu friends\n", person->first_name,
            person->last_name, person->handle, person->friend_count);
    }
}

/// stats displays information about the network
///
/// @param params   string array of parameters (not used)
static void stats(char* params[]){
    //Ignore unused paramter error
    (void)params;

    char* pluralized_person = user_count == 1 ? "person" : "people";
    char* pluralized_friendship = friend_count == 1 ? "friendship" : "friendships";

    if(friend_count == 1){

    }

    printf("Statistics:  %zd %s, %zd %s\n", user_count, pluralized_person, friend_count, pluralized_friendship);
}

/// unfriend removes friendship from two friended users
///
/// @param params   string array of parameters: handle1 handle2
/// @pre            both handles must be non-null and non-empty
static void unfriend(char* params[]){
    if(!ht_has(users, params[0])){
        fprintf(stderr, "error: '%s' is not a known handle\n", params[0]);
        return;
    }
    else if(!ht_has(users, params[1])){
        fprintf(stderr, "error: '%s' is not a known handle\n", params[1]);
        return;
    }

    person_t* person_1 = (person_t*)ht_get(users, params[0]);
    person_t* person_2 = (person_t*)ht_get(users, params[1]);

    short exists = 0;
    for(size_t i = 0; i < person_1->friend_count; i++){
        if(exists){
            //Shift everything in the array back one
            person_1->friends[i-1] = person_1->friends[i];
        }
        else if(person_1->friends[i]->handle == person_2->handle){
            exists = 1;
        }
    }
    exists = 0;
    for(size_t i = 0; i < person_2->friend_count; i++){
        if(exists){
            //Shift everything in the array back one
            person_1->friends[i-1] = person_2->friends[i];
        }
        else if(person_2->friends[i]->handle == person_1->handle){
            exists = 1;
        }
    }
    if(exists){
        friend_count--;
        person_1->friend_count--;
        person_2->friend_count--;
        printf("%s and %s are no longer friends\n", params[0], params[1]);
    }
    else{
        fprintf(stderr, "error: '%s' and '%s' are not friends.\n", params[0], params[1]);
    }
}

typedef struct command_s{
    void (*function)(char**);
    char* name;
    char* params;
    int index;
} command_t;

//Stores command data
static command_t commands[] = {
    {init, "init", "", 0},
    {add, "add", "first-name last-name handle", 1},
    {print, "print", "handle", 2},
    {friend, "friend", "handle1 handle2", 3},
    {size, "size", "handle", 4},
    {stats, "stats", "", 5},
    {unfriend, "unfriend", "handle1 handle2", 6}
};

//Hash table for O(1) calling of commands
static Table command_table;

/// execute_command takes command info and executes the correct command
///
/// @param command      string command to execute
/// @param_count        integer number of parameters
/// @params             string array of paramters
static void execute_command(const char * command, size_t param_count, char * params[]){
    if(!ht_has(command_table, command)){
        return;
    }

    unsigned int command_num = *((int*)ht_get(command_table, command));

    char* token = (char*)commands[command_num].params;
    unsigned int token_count = 0;
    while(*token != '\0'){
        token++;
        if(*token == ' ' || *token == '\0'){
            token_count++;
        }
    }

    // throw error for improper amount of args
    if(token_count == param_count){
        commands[command_num].function(params);
    }
    else{
        fprintf(stderr, "error: %s command usage: %s %s\n", command, command, commands[command_num].params);
    }
}

/// poll_input continually polls for and tolkenizes user input.
///     Then reads the command and executes the right function
static void poll_input(){
    //Get input
    char input[MAX_INPUT];
    printf("amici> ");
    while(fgets(input, MAX_INPUT, stdin)){


        //Set command string
        char* command_token = strtok(input, " ,\t\n");

        if(strcmp(command_token, "quit") == 0){
            break;
        }

        //Get all parameters
        char* param_token[MAX_INPUT];
        char* token = command_token;
        size_t param_count = 0;
        while(token != NULL){
            token = strtok(NULL, " ,\t\n");
            param_token[param_count] = token;
            param_count++;
        }

        //Execute command
        execute_command(command_token, param_count - 1, param_token);

        printf("amici> ");
    }
}

int main(void){
    users = ht_create(str_hash, str_equals, str_pptr_print, delete_str_pptr);

    command_table = ht_create(str_hash, str_equals, str_long_print, NULL);

    for(int i = 0; i < (int)(sizeof(commands) / sizeof(command_t)); i++){
        ht_put(command_table, (void*)commands[i].name, &commands[i].index);
    }

    poll_input();

    //Free memory
    ht_destroy(command_table);
    ht_destroy(users);
    return 0;
}