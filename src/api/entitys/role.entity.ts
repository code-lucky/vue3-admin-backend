import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RoleData } from "./role-data.entity";

@Entity({
    name: 'role'
})
export class Role{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: '角色名称',
        name: 'role_name'
    })
    roleName: string;

    @Column({
        name: 'is_delete',
        comment: '逻辑删除0是正常状态，1是删除',
        default: 0
    })
    isDelete: number;

    @CreateDateColumn({
        name: 'create_time'
    })
    createTime: Date;

    @CreateDateColumn({
        name: 'update_time'
    })
    updateTime: Date;

    @OneToMany(() => RoleData, roleData => roleData.role)
    roleData: RoleData[];
}