import { Field, Int, ObjectType } from "type-graphql";
import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

// Databse table
@ObjectType()
@Entity("users")
export class User extends BaseEntity {
    @Field(() => Int) // It can't infer number, need to specify it's an integer or a float
    @PrimaryGeneratedColumn()
    id: number;

    // database column
    @Field()
    @Column('text')
    email: string;

    @Column('text')
    password: string;
}

